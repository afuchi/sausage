import yt_dlp
import json
import os
import re
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
SAUSAGE_JSON = BASE_DIR / "src" / "data" / "sausages.json"
NSE_JSON = BASE_DIR / "src" / "data" / "nse.json"
TEMP_DIR = Path("C:/tmp")

# Numbers mapping for speech-to-text
NUMBER_MAP = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    'half': 0.5, '.5': 0.5
}

def format_duration(seconds):
    if not seconds: return "00:00"
    m = int(seconds) // 60
    s = int(seconds) % 60
    return f"{m:02d}:{s:02d}"

def fetch_latest_videos(limit=20):
    ydl_opts = {
        'extract_flat': True,
        'playlistend': limit,
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info('https://www.youtube.com/c/OrdinarySausage/videos', download=False)
        return info['entries']

def download_subtitles(video_id):
    """Downloads auto-captions and returns the parsed text, or empty string."""
    ydl_opts = {
        'quiet': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['en'],
        'skip_download': True,
        'outtmpl': str(TEMP_DIR / '%(id)s.%(ext)s'),
        'no_warnings': True
    }
    
    vtt_file = TEMP_DIR / f"{video_id}.en.vtt"
    if vtt_file.exists():
        vtt_file.unlink() # remove old
        
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
            
        if vtt_file.exists():
            with open(vtt_file, 'r', encoding='utf-8') as f:
                content = f.read()
            vtt_file.unlink() # cleanup
            return content
    except Exception as e:
        print(f"Error downloading subs for {video_id}: {e}")
        
    return ""

def parse_rating_from_subs(subs_text):
    """Attempts to find X out of 5 Mark Ruffalos and Burst status."""
    if not subs_text:
        return 'N/A', 0
        
    rating = 'N/A'
    dibu = 0 # 0 = no burst, 1 = burst
    
    # 1. Look for burst
    if re.search(r'\bburst\b', subs_text, re.IGNORECASE):
        dibu = 1
        
    # 2. Look for Mark Ruffalo score
    # Look for "X score" or "X Mark Ruffalo" or "X Buffalo"
    # The speech-to-text might say "four out of five", "four mark ruffalo", "4 out of 5", "four buffalo"
    matches = re.findall(r'(\w+)[-\s]*(and a half)?(?:.*?(?:out of 5|mark|ruffalo|buffalo))', subs_text, re.IGNORECASE)
    
    best_score = None
    
    for match in matches:
        base_num_str = match[0].lower().strip()
        half_str = match[1].lower().strip() if len(match) > 1 else ""
        
        score = 0
        if base_num_str in NUMBER_MAP:
            score += NUMBER_MAP[base_num_str]
        elif base_num_str == 'half':
            score = 0.5
            
        if half_str and 'half' in half_str:
            score += 0.5
            
        # Valid scores are usually 0 to 5, rarely 6 or 100, but let's constrain to realistic bounds
        if 0 <= score <= 6:
            best_score = score
            # We want the LAST valid score mentioned, usually near the end of the video
    
    if best_score is not None:
        # Format it
        if best_score == int(best_score):
            rating = f"{int(best_score)}/5"
        else:
            rating = f"{best_score}/5"
            
    return rating, dibu

def load_json(filepath):
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def process_video(v):
    vid = v.get('id')
    title = v.get('title', '')
    dur = format_duration(v.get('duration', 0))
    
    # Download subs and parse
    print(f"  Parsing subtitles for {vid}...")
    subs = download_subtitles(vid)
    rating, burst = parse_rating_from_subs(subs)
    
    if 'sausage' in title.lower():
        return {
            'is_sausage': True,
            'data': {
                'type': title.split('Sausage')[0].strip() + ' Sausage' if 'Sausage' in title else title,
                'rating': rating,
                'dibl': f"{rating} Mark Ruffalos" if rating != 'N/A' else 'N/A',
                'dibu': burst,
                'song': 'Unknown',
                'episode': title,
                'episodeID': vid,
                'episodeType': 'Standard',
                'episodeLength': dur
            }
        }
    else:
        return {
            'is_sausage': False,
            'data': {
                'type': title,
                'rating': rating,
                'song': 'Unknown',
                'episode': title,
                'episodeID': vid,
                'episodeLength': dur
            }
        }

def update_database(limit=20):
    print("Fetching latest YouTube videos...")
    yt_videos = fetch_latest_videos(limit)
    
    sausages = load_json(SAUSAGE_JSON)
    nses = load_json(NSE_JSON)

    existing_ids = set()
    for s in sausages:
        if 'episodeID' in s: existing_ids.add(s['episodeID'])
    for n in nses:
        if 'episodeID' in n: existing_ids.add(n['episodeID'])

    new_sausages = []
    new_nses = []

    yt_videos.reverse()

    for v in yt_videos:
        if v.get('id') in existing_ids: continue
        res = process_video(v)
        if res['is_sausage']:
            new_sausages.append(res['data'])
        else:
            new_nses.append(res['data'])

    if new_sausages:
        next_id = sausages[-1]['id'] + 1 if sausages else 1
        for i, s in enumerate(new_sausages):
            s['id'] = next_id + i
        sausages.extend(new_sausages)

    if new_nses:
        next_id = nses[-1]['id'] + 1 if nses else 1
        for i, n in enumerate(new_nses):
            n['id'] = next_id + i
        nses.extend(new_nses)

    if new_sausages or new_nses:
        save_json(SAUSAGE_JSON, sausages)
        save_json(NSE_JSON, nses)
        print(f"Added {len(new_sausages)} new sausages and {len(new_nses)} new NSEs.")
    else:
        print("Database is up-to-date. No new videos found.")

if __name__ == "__main__":
    update_database(20)

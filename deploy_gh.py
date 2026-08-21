#!/usr/bin/env python3
"""Загрузка dist/ в GitHub Pages репозиторий через Contents API и включение Pages."""
import base64
import json
import os
import sys
import urllib.request
import urllib.error

OWNER = 'unicompact-stack'
REPO = 'fsm-pro'
BRANCH = 'main'
DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')


def load_token():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    with open(env_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('GITHUB_TOKEN='):
                return line.split('=', 1)[1].strip()
    raise RuntimeError('GITHUB_TOKEN not found in .env')


def api(method, url, token, data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', f'token {token}')
    req.add_header('Accept', 'application/vnd.github+json')
    req.add_header('User-Agent', 'fsm-pro-deploy')
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, data=body) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', errors='ignore')
        try:
            return e.code, json.loads(raw) if raw else {}
        except Exception:
            return e.code, {'error': raw}


def list_files(root):
    result = []
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root).replace('\\', '/')
            result.append((rel, full))
    return result


def upload_file(token, rel_path, full_path):
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/contents/{rel_path}'
    # Проверить, существует ли файл, чтобы получить sha
    status, data = api('GET', url, token)
    sha = data.get('sha') if status == 200 else None
    with open(full_path, 'rb') as f:
        content_b64 = base64.b64encode(f.read()).decode('ascii')
    payload = {
        'message': f'Deploy {rel_path}',
        'content': content_b64,
        'branch': BRANCH,
    }
    if sha:
        payload['sha'] = sha
    status, data = api('PUT', url, token, payload)
    if status in (200, 201):
        return True
    print(f'  FAIL {rel_path}: {status} {data}')
    return False


def enable_pages(token):
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/pages'
    payload = {'source': {'branch': BRANCH, 'path': '/'}}
    status, data = api('POST', url, token, payload)
    if status in (200, 201, 409):
        print(f'Pages enabled: {status} {data.get("html_url", "")}')
        return True
    print(f'FAIL pages: {status} {data}')
    return False


def main():
    token = load_token()

    # Проверяем токен
    status, data = api('GET', 'https://api.github.com/user', token)
    if status != 200:
        print(f'FAIL user check: {status} {data}')
        sys.exit(1)
    print(f'OK user: {data.get("login")}')

    files = list_files(DIST)
    print(f'Uploading {len(files)} files to {OWNER}/{REPO}...')
    ok = True
    for rel, full in files:
        rel = rel.replace('\\', '/')
        print(f'  {rel}')
        ok &= upload_file(token, rel, full)

    if not ok:
        print('Upload finished with errors')
        sys.exit(1)

    print('All files uploaded. Enabling GitHub Pages...')
    enable_pages(token)
    print(f'DONE: https://{OWNER}.github.io/{REPO}/')


if __name__ == '__main__':
    main()
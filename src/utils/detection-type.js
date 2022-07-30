const DEFAULT = {
  'php': 'php',
  'py': 'python',
  'sql': 'sql',
  'css': 'css',
  'html': 'html',
  'md': 'markdown'
}
const NGINX = {
  'config': 'nginx',
  'conf': 'nginx',
}
const OS_QUERY = {
  'history': 'sql',
}

const Map = {
  "/etc/nginx": NGINX,
  "/root/.OS_QUERY": OS_QUERY,
}

function getMap(path) {
  for (let i in Map) {
    if (path.startsWith(i)) {
      return Map[i]
    }
  }
  return DEFAULT
}


export function detection(path) {
  let _map = getMap(path)
  for (const e in _map) {
    if (path.toLowerCase().endsWith("." + e)) {
      return _map[e]
    }
  }
  return 'text'
}



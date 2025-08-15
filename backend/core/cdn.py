# core/cdn.py
import os
import logging

_CDN_DEBUG = os.getenv("CDN_DEBUG", "0") == "1"
_logger = logging.getLogger("rush.cdn")
if _CDN_DEBUG and not _logger.handlers:
    _logger.setLevel(logging.DEBUG)
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter("[CDN] %(message)s"))
    _logger.addHandler(h)


def _base_url() -> str:
    # Her çağrıda oku (import-time cache yok)
    return os.getenv("PUBLIC_ASSETS_BASE_URL", "").rstrip("/")


def _normalize_key(key: str) -> str:
    """
    - leading '//' -> '/'
    - leading '/' -> at
    - **static/** ÖNEKİNİ ARTIK KESMİYORUZ.
      (base'de /static varsa veya key'de static/ varsa, birleşimden sonra dedupe yapacağız.)
    """
    k = key.strip().replace("//", "/")
    if k.startswith("http://") or k.startswith("https://"):
        return k
    while k.startswith("/"):
        k = k[1:]
    return k  # 'static/products/...' ya da 'products/...'


def public_url(key: str | None) -> str:
    if not key:
        if _CDN_DEBUG:
            _logger.debug("empty-key -> ''")
        return ""

    base = _base_url()
    norm = _normalize_key(str(key))

    # Tam URL ise aynen bırak
    if norm.startswith("http://") or norm.startswith("https://"):
        out = norm
        if _CDN_DEBUG:
            _logger.debug(f"already-abs | base='{base}' key='{key}' norm='{norm}' -> out='{out}'")
        return out

    # Birleştir
    if base:
        out = f"{base}/{norm}"
    else:
        # Dev fallback: local StaticFiles mount
        # Key zaten 'static/...' ile başlıyorsa tekrar eklemeyelim
        out = f"/{norm}" if norm.startswith("static/") else f"/static/{norm}"

    # Path düzeltmeleri (domain kısmına dokunmadan):
    # 1) /static/static/ -> /static/
    out = out.replace("/static/static/", "/static/")

    if _CDN_DEBUG:
        _logger.debug(f"compose | base='{base}' key='{key}' norm='{norm}' -> out='{out}'")

    return out

# Tam Sürüm Login Gereklilikleri ve Standartları

Bu dosya, Rush uygulaması için MVP sonrası tam sürüme çıkışta, **email login**, **Google login**, **Apple login** ve **2 Faktörlü Doğrulama (2FA)** akışlarında karşılanması gereken tüm güvenlik ve kalite standartlarını içerir.

---

## Genel Tüm Login Provider'ları için Ortak Gereklilikler

- [ ] HTTPS aktif olmalı, tüm endpointler şifreli (SSL/TLS, Nginx veya Caddy üzerinden)
- [ ] JWT secret yalnızca .env’de, güçlü ve uzun olmalı, kodda asla yer almamalı
- [ ] CORS sadece izin verilen originlere açık olmalı
- [ ] Login endpointlerinde brute-force ve abuse’a karşı rate limit (örn. slowapi, redis)
- [ ] Başarılı/başarısız login, device/IP/email/time ile loglanıyor
- [ ] Email/şifre frontend’de ve backend’de validasyondan geçiriliyor
- [ ] Tüm hata mesajları bilgi sızdırmaz şekilde ("Kullanıcı veya şifre yanlış")
- [ ] JWT token süresi kısa (15-30dk), refresh token ile oturum uzatma
- [ ] Şifreler hashli ve salted, bcrypt veya argon2 ile
- [ ] Gereksiz debug logları, test endpointleri production’da kapalı
- [ ] Mobilde JWT expo-secure-store, keychain veya keystore ile saklanıyor

---

## 1. E-posta ile Login (Email/Password)

- [ ] Şifreler **bcrypt/argon2** ile hash’li, raw asla tutulmaz
- [ ] Şifremi Unuttum (reset token, e-mail ile), token expire olur
- [ ] Email doğrulama akışı (kayıttan sonra veya login öncesi)
- [ ] Her başarısız girişte aynı hata mesajı
- [ ] Parola değiştirme ve karmaşıklık kontrolü
- [ ] Hesap kilitleme (çok deneme sonrası geçici kilit)
- [ ] İlk giriş veya yeni cihazda 2FA (opsiyonel)

---

## 2. Google Login

- [ ] Google’dan dönen **id_token** backend’de verify ediliyor (JWT verify)
- [ ] Google hesabı ile eşleşen veya yeni local kullanıcı oluşturuluyor
- [ ] Google profilinden email, ad, foto alınarak user profile güncelleniyor
- [ ] Google login emaili backend’de verified olarak işleniyor
- [ ] Google hesabı başka bir provider hesabı ile merge edilebiliyor (opsiyonel)

---

## 3. Apple Login

- [ ] Apple’ın **identity_token**’ı backend’de Apple public key ile verify ediliyor
- [ ] İlk kez login olan Apple kullanıcısı için local hesap açılıyor
- [ ] Apple kimliği (sub) local user ile eşleştiriliyor
- [ ] Masked veya eksik email gelirse kullanıcıdan email tamamlatılıyor

---

## 4. 2 Faktörlü Doğrulama (2FA/OTP)

- [ ] Kullanıcıda telefon varsa login sonrası SMS ile 6 haneli OTP gönder, yoksa email ile gönder
- [ ] OTP tek kullanımlık, 3-10 dakika arası geçerli (expire)
- [ ] Hatalı OTP denemelerinde limit (örn. 5 deneme = 10dk ban)
- [ ] Kodlar hash’li olarak saklanıyor, raw tutulmaz
- [ ] 2FA ekranı front-end’de temiz, loading & hata mesajları ile
- [ ] Yeni cihaz veya IP’den loginlerde otomatik 2FA tetiklenir
- [ ] 2FA girişleri ve sonuçları loglanır

---

## Ekstra Güvenlik & Kalite Standartları

- [ ] Login/signup akışında robot/captcha koruması (Google reCAPTCHA vs.)
- [ ] Refresh token hırsızlığı veya çalınmasında eski token blacklist edilir
- [ ] Kullanıcıya "cihaz yönetimi" ve uzaktan oturum kapatma imkanı
- [ ] Audit log: kritik tüm user aksiyonları kaydedilir
- [ ] Log/alert sistemi: olağandışı davranışlarda otomatik bildirim

---

> **Not:**  
> Bu doküman her yeni sürüm öncesi review edilmelidir. Eksik veya zayıf olan başlıklar öncelikli iş listesine alınmalıdır.


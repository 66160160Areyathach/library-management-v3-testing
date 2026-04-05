# 🔒 Security Test Plan (แผนการทดสอบความปลอดภัย)

## 1. ข้อมูลทั่วไป (Executive Summary)
- **ระบบ:** Library Management System v2
- **ประเภทการทดสอบ:** Security Testing & Static Analysis
- **ระยะเวลา:** สัปดาห์ที่ 2-3

## 2. ขอบเขตการทดสอบ (Scope)
- API Endpoints ทั้งหมดใน Controllers (Auth, Books, Members, Borrowing)
- ระบบ Session และ Authentication Middleware
- กลไกการป้องกัน SQL Injection และ XSS Attack

## 3. กลยุทธ์การทดสอบ (Test Strategy)
### 3.1 Static Application Security Testing (SAST)
- สแกนโค้ดด้วย `ESLint`
- Code Review แบบ Manual ด้วย Security Checklist

### 3.2 Dynamic Application Security Testing (DAST) / Manual Test
- **SQL Injection:** แทรก Payload เช่น `' OR 1=1--` ในช่อง Search และ Login
- **Cross-Site Scripting (XSS):** แทรก Payload `<script>` ลงในช่อง Title/Author ของ Books
- **Broken Authentication:** ทดสอบเจาะ Session แบบหมดอายุ (Expired), Brute-force Login

## 4. สภาพแวดล้อมที่ใช้ทดสอบ (Test Environment)
- **Framework:** Jest, Supertest
- **Database:** SQLite (Test Environment database)

## 5. เกณฑ์การผ่านประเมิน (Exit Criteria)
1. ไม่พบช่องโหว่ระดับ High และ Critical (เช่น SQL Injection)
2. ปัญหา XSS (ถ้าพบ) ต้องมี Report และ Recommendation ที่ชัดเจน
3. Code Coverage จาก Test Case ด้าน Security ต้องครอบคลุม > 70%

## 6. ทรัพยากร (Resource Planning)
- **Security Tester:** รับผิดชอบออกแบบ Payload XSS, SQLi
- **QA Analyst:** รับผิดชอบสรุป Test Coverage
- **Test Lead:** ตรวจสอบและลงนามรับรองแผน
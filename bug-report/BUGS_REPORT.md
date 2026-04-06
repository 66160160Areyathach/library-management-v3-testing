# Bug Report Template

เมื่อพบ bug โปรดกรอกฟอร์มนี้อย่างละเอียด

---

## ข้อมูลพื้นฐาน

**ชื่อ/ID นิสิต:66160018

**วันที่พบ bug:5/4/2569

**ลำดับที่ของ bug:001

---

## ข้อมูลเกี่ยวกับ Bug

### 1.เกิด Error 500 เมื่อส่ง Request Body เป็น JSON ผิดไวยากรณ์ (Login API)

**API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:**

### 2. ความสำคัญ (Severity)

เลือกระดับความสำคัญ:

- [ ] **Critical** - ระบบไม่ทำงาน/สูญเสียข้อมูล
- [X] **Major** - ฟังก์ชันหลักทำงานผิด
- [ ] **Minor** - ฟังก์ชันรองทำงานผิด
- [ ] **Trivial** - ปัญหาด้านการแสดงผล/UI

---

### 3. ลักษณะของ Bug (Type)

เลือกประเภท:

- [X] Functional bug (ฟังก์ชันทำงานผิด)
- [ ] Logic bug (ตรรกะผิด)
- [ ] Performance bug (ประสิทธิภาพต่ำ)
- [ ] Security bug (ความปลอดภัย)
- [ ] UI/UX bug (ปัญหาการแสดงผล)
- [ ] Database bug (ปัญหาฐานข้อมูล)
- [X] Other: Improper Error Handling (จัดการ Error ไม่เหมาะสม)

### 4. ส่วนที่มี Bug (Component/Module)

เลือกส่วนที่มี bug:

- [X] Authentication (การล็อกอิน)
- [ ] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

---

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

ลิสต์ขั้นตอนทีละขั้นตอนเพื่อสร้างซ้ำ bug:

1. เปิดโปรแกรม Postman

2. ตั้งค่า HTTP Method เป็น POST และระบุ URL เป็น http://localhost:3000/api/auth/login

3. ไปที่แท็บ Body เลือกประเภทเป็น raw และเลือกรูปแบบเป็น JSON

4. ป้อนข้อมูลที่ผิดไวยากรณ์ JSON (Malformed JSON) เช่น ไม่ใส่เครื่องหมายปีกกา {} หรือพิมพ์รูปแบบผิด เช่น username = dffff

5. กดปุ่ม Send เพื่อส่ง Request

---

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)

ระบบควรทำงานอย่างไร:ระบบควรตรวจสอบความถูกต้องของรูปแบบข้อมูล (Payload) หากพบว่าไม่ใช่ JSON 
ที่ถูกต้อง ควรตอบกลับด้วย HTTP Status 400 Bad Request พร้อมข้อความแจ้งเตือน
ว่ารูปแบบข้อมูลไม่ถูกต้อง

### 7. พฤติกรรมจริง (Actual Behavior)

ระบบทำงานอย่างไรจริงๆ:

ระบบไม่สามารถอ่านข้อมูลได้ เกิด Unhandled Exception จนเซิร์ฟเวอร์ทำงานผิดพลาด
และตอบกลับด้วย HTTP Status 500 Internal Server Error

### 8. ผลกระทบ (Impact)

ผลกระทบต่อการใช้งาน:
ผู้ใช้งานหรือระบบ Frontend จะไม่ทราบสาเหตุที่แท้จริงของการเกิด Error 
และหากถูกยิง Request ผิดรูปแบบซ้ำๆ อาจทำให้เซิร์ฟเวอร์ล่ม (Crash) ได้

### 9. ข้อมูลเพิ่มเติม (Additional Information)

### ข้อมูล Environment:

- **OS:** Windows
- **Browser:** API Testing via Postman
- **Version of System:v2



### Error Messages:
{
    "error": "Invalid username or password"
}

### Console Logs:


### BUG-02
### ข้อมูลพื้นฐาน
    ชื่อ/ID นิสิต: 66160018
    วันที่พบ bug: 5/4/2569
    ลำดับที่ของ bug: 002
### ข้อมูลเกี่ยวกับ Bug
### 1. ระบบไม่ Validate ความยาว Input — Username 300 ตัวอักษรผ่านได้ คืน 401 แทน 400
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:

### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[ ] Major - ฟังก์ชันหลักทำงานผิด
[X] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[X] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[X] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [X] Authentication (การล็อกอิน)
- [ ] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***



### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

1.เปิดโปรแกรม Postman
2.สร้าง Request ใหม่ ตั้งค่า HTTP Method เป็น POST และระบุ URL เป็น http://localhost:3000/api/auth/login
3.ไปที่แท็บ Body เลือก raw (JSON) และระบุ username เป็น string ยาว 300 ตัวอักษร:

    json{
        "username": "AAAA...AAA (300 ตัวอักษร)",
        "password": "anypassword"
}

กดปุ่ม Send เพื่อส่ง Request
### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรตรวจสอบความยาวของ input และตอบกลับด้วย HTTP Status 400 Bad Request พร้อมแจ้งว่า username ยาวเกินกำหนด
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบรับ input ยาว 300 ตัวอักษรเข้าไปประมวลผล และตอบกลับด้วย 401 Unauthorized แทนที่จะ validate ก่อน
### 8. ผลกระทบ (Impact)
เสี่ยงต่อการโจมตีแบบ Buffer Overflow หรือ DoS เนื่องจากไม่มีการจำกัดความยาว input
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-006


### BUG-03
### ข้อมูลเกี่ยวกับ Bug
### 1. ไม่มี Rate Limiting บน Login Endpoint เสี่ยงต่อ Brute Force Attack
    API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[X] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[ ] Major - ฟังก์ชันหลักทำงานผิด
[ ] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[ ] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[X] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [X] Authentication (การล็อกอิน)
- [ ] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
สร้าง Request ใหม่ ตั้งค่า HTTP Method เป็น POST และระบุ URL เป็น http://localhost:3000/api/auth/login
ส่ง Request ซ้ำ 50 ครั้งติดกันอย่างรวดเร็ว (ใช้ Postman Runner หรือ script)
สังเกต Response ว่ายังคืน 200/401 ปกติโดยไม่มีการบล็อก

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรจำกัดจำนวนการ login ที่ผิดพลาดต่อเนื่อง และตอบกลับด้วย HTTP Status 429 Too Many Requests เมื่อเกินขีดจำกัด
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบยังคงตอบกลับ HTTP 200 / 401 ปกติทุกครั้ง ไม่มีการ throttle หรือบล็อก IP แต่อย่างใด
### 8. ผลกระทบ (Impact)
ผู้โจมตีสามารถ Brute Force รหัสผ่านได้ไม่จำกัด ถือเป็นช่องโหว่ด้านความปลอดภัยระดับ Critical
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-007


### BUG-04
### ข้อมูลเกี่ยวกับ Bug
### 1. ระบบยอมรับ Invalid Token คืน 200 แทน 401 ข้อมูลหนังสือหลุดสู่ผู้ไม่มีสิทธิ์
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[X] Major - ฟังก์ชันหลักทำงานผิด
[ ] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[ ] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[X] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [ ] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
สร้าง Request ใหม่ ตั้งค่า HTTP Method เป็น GET และระบุ URL เป็น http://localhost:3000/api/books
ไปที่แท็บ Headers เพิ่ม Key ชื่อ Authorization และใส่ Value เป็น Bearer invalid_token_123
กดปุ่ม Send เพื่อส่ง Request

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรตรวจสอบ Token และตอบกลับด้วย HTTP Status 401 Unauthorized พร้อม message ว่า token ไม่ถูกต้อง
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบตอบกลับด้วย HTTP 200 OK พร้อมส่งข้อมูลรายการหนังสือทั้งหมดกลับมา
### 8. ผลกระทบ (Impact)
ข้อมูลหนังสือในระบบหลุดสู่ผู้ที่ไม่มีสิทธิ์เข้าถึง ถือเป็นช่องโหว่ด้านความปลอดภัยระดับสูง
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-010


### BUG-05
### ข้อมูลเกี่ยวกับ Bug
### 1. GET /api/books ไม่บังคับ Token คืน 200 โดยไม่มีการ Authenticate
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[X] Major - ฟังก์ชันหลักทำงานผิด
[ ] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[ ] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[X] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [X] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
สร้าง Request ใหม่ ตั้งค่า HTTP Method เป็น GET และระบุ URL เป็น http://localhost:3000/api/books
ไม่ใส่ Authorization header ใดๆ
กดปุ่ม Send เพื่อส่ง Request

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรบังคับให้ผู้ใช้งานแนบ Token ทุกครั้ง หากไม่มี Token ควรตอบกลับด้วย HTTP Status 401 Unauthorized
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบตอบกลับด้วย HTTP 200 OK พร้อมส่งข้อมูลรายการหนังสือทั้งหมดโดยไม่ต้องมีการ authenticate
### 8. ผลกระทบ (Impact)
ใครก็ได้สามารถเข้าถึงข้อมูลหนังสือได้โดยไม่ต้อง login ทำให้ระบบ authentication ไม่มีความหมาย
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-011

### BUG-06
### ข้อมูลเกี่ยวกับ Bug
### 1. Filter ?available=true ไม่ทำงาน คืนหนังสือที่หมด Stock รวมด้วย
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[ ] Major - ฟังก์ชันหลักทำงานผิด
[X] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[X] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[ ] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [X] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
Login เพื่อรับ JWT Token ที่ถูกต้อง
สร้าง Request ใหม่ GET http://localhost:3000/api/books?available=true พร้อมแนบ Token
กดปุ่ม Send และตรวจสอบรายการหนังสือใน Response

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรกรองเฉพาะหนังสือที่มี available_copies > 0 และตอบกลับด้วย HTTP Status 200 OK
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบคืนรายการหนังสือ ทั้งหมด รวมถึงหนังสือที่ available_copies = 0 (หมด stock) ด้วย
### 8. ผลกระทบ (Impact)
ผู้ใช้งานเห็นหนังสือที่ไม่สามารถยืมได้ในรายการ ทำให้ UX สับสนและไม่ตรงกับ business logic
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:
OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-013

### BUG-07
### ข้อมูลเกี่ยวกับ Bug
### 1. POST /api/books ไม่ตอบสนอง — Endpoint อาจยังไม่ Implement หรือ Route ผิด
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[X] Major - ฟังก์ชันหลักทำงานผิด
[ ] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[X] Functional bug (ฟังก์ชันทำงานผิด)
[ ] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[ ] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [X] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
Login เพื่อรับ JWT Token ที่มีสิทธิ์ admin
สร้าง Request ใหม่ POST http://localhost:3000/api/books พร้อมแนบ Token
ไปที่แท็บ Body ระบุข้อมูล:

json{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Computer",
  "total_copies": 2,
  "available_copies": 2,
  "shelf_location": "A-110"
}

กดปุ่ม Send เพื่อส่ง Request

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรเพิ่มหนังสือใหม่เข้าฐานข้อมูล และตอบกลับด้วย HTTP Status 201 Created พร้อม book object ใหม่
### 7. พฤติกรรมจริง (Actual Behavior)
Endpoint ไม่ตอบสนอง หรือคืน error ที่บ่งชี้ว่า route ยังไม่ถูก implement
### 8. ผลกระทบ (Impact)
ฟังก์ชันเพิ่มหนังสือใหม่เข้าระบบใช้งานไม่ได้เลย admin ไม่สามารถจัดการ catalog หนังสือได้
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:
OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-014

### BUG-08
### ข้อมูลเกี่ยวกับ Bug
### 1. POST /api/books ไม่ตรวจสอบ Token ใครก็เพิ่มหนังสือได้
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[X] Major - ฟังก์ชันหลักทำงานผิด
[ ] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[ ] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[X] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [X] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***

### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
สร้าง Request ใหม่ POST http://localhost:3000/api/books
ไม่ใส่ Authorization header ใดๆ
ระบุ Body ข้อมูลหนังสือ แล้วกด Send

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรบังคับให้แนบ Token และตรวจสอบสิทธิ์ admin ก่อน หากไม่มีให้ตอบกลับด้วย 401 Unauthorized
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบตอบกลับด้วย HTTP 201 Created สามารถเพิ่มหนังสือได้โดยไม่ต้องมี Token
### 8. ผลกระทบ (Impact)
บุคคลภายนอกสามารถเพิ่มหนังสือปลอมเข้าระบบได้ ทำให้ข้อมูลใน catalog ไม่น่าเชื่อถือ
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-017


### BUG-09
### ข้อมูลเกี่ยวกับ Bug
### 1. GET /api/books/abc คืน 404 แทน 400 ควร Validate ว่า :id ต้องเป็น Integer
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[ ] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[ ] Major - ฟังก์ชันหลักทำงานผิด
[X] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[X] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[ ] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[ ] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [X] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [ ] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [ ] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***


### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
Login เพื่อรับ JWT Token ที่ถูกต้อง
สร้าง Request ใหม่ GET http://localhost:3000/api/books/abc พร้อมแนบ Token
กดปุ่ม Send เพื่อส่ง Request

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควร validate ว่า :id ต้องเป็นตัวเลข integer เมื่อรับค่าที่ไม่ใช่ตัวเลขควรตอบกลับด้วย 400 Bad Request พร้อม error message: "Invalid book ID"
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบตอบกลับด้วย HTTP 404 Not Found แทนที่จะเป็น 400 ซึ่งทำให้ client ตีความผิดว่า "ไม่เจอ resource" แทนที่จะเป็น "input ผิด"
### 8. ผลกระทบ (Impact)
Client จะ handle error ผิดพลาด เนื่องจาก semantic ของ 404 กับ 400 ต่างกัน ส่งผลต่อ error handling ฝั่ง frontend
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-022


### BUG-10
### ข้อมูลเกี่ยวกับ Bug
### 1. DELETE ลบหนังสือที่มีสถานะ Borrowed ได้ ทำให้ Borrowing Record กำพร้า
API and Integration Testing Focus - ทดสอบ Backend API อย่างถูกต้อง:
### 2. ความสำคัญ (Severity)
[X] Critical - ระบบไม่ทำงาน/สูญเสียข้อมูล
[ ] Major - ฟังก์ชันหลักทำงานผิด
[ ] Medium - ฟังก์ชันรองทำงานผิดเล็กน้อย
[ ] Minor - ปัญหาด้านการแสดงผล/UI
[ ] Trivial - ปัญหาเล็กน้อย


### 3. ลักษณะของ Bug (Type)

[ ] Functional bug (ฟังก์ชันทำงานผิด)
[X] Logic bug (ตรรกะผิด)
[ ] Performance bug (ประสิทธิภาพต่ำ)
[ ] Security bug (ความปลอดภัย)
[ ] UI/UX bug (ปัญหาการแสดงผล)
[X] Database bug (ปัญหาฐานข้อมูล)

### 4. ส่วนที่มี Bug (Component/Module)

- [ ] Authentication (การล็อกอิน)
- [X] Books Management (จัดการหนังสือ)
- [ ] Members Management (จัดการสมาชิก)
- [X] Borrowing/Return (ยืม/คืนหนังสือ)
- [ ] Dashboard (แดชบอร์ด)
- [X] Database
- [X] API
- [ ] Other: **\*\*\*\***\_\_\_**\*\*\*\***


### 5. ขั้นตอนการสร้างซ้ำ (Steps to Reproduce)

เปิดโปรแกรม Postman
Login เพื่อรับ JWT Token ที่มีสิทธิ์ admin
ตรวจสอบว่าหนังสือ ID=5 มีสถานะ borrowed อยู่
สร้าง Request ใหม่ DELETE http://localhost:3000/api/books/5 พร้อมแนบ Token
กดปุ่ม Send เพื่อส่ง Request

### 6. พฤติกรรมที่คาดหวัง (Expected Behavior)
ระบบควรตรวจสอบว่าหนังสือถูกยืมอยู่ก่อนลบ หากมีการยืมค้างอยู่ควรตอบกลับด้วย 409 Conflict พร้อมแจ้งว่าไม่สามารถลบได้
### 7. พฤติกรรมจริง (Actual Behavior)
ระบบตอบกลับด้วย HTTP 200 OK และลบหนังสือสำเร็จ ทั้งที่หนังสือถูกยืมอยู่ ทำให้ borrowing record กำพร้า (orphan)
### 8. ผลกระทบ (Impact)
ข้อมูลในฐานข้อมูลเกิด data integrity issue สมาชิกที่ยืมหนังสืออยู่จะไม่สามารถคืนหนังสือได้ และรายงานการยืม/คืนจะผิดพลาด
### 9. ข้อมูลเพิ่มเติม (Additional Information)
ข้อมูล Environment:

OS: Windows
Browser: API Testing via Postman
Version of System: v2
TC Ref.: TC-031

## เคล็ดลับการรายงาน Bug ที่ดี

✅ **ดี:**
- "เมื่อยืมหนังสือวันที่ 1 พค. และกำหนดคืนวันที่ 15 พค. หลังคืนวันที่ 20 พค. ระบบคำนวณค่าปรับเป็น 0 บาท แต่ควรเป็น 50 บาท"

❌ **ไม่ดี:**

- "ระบบคำนวณค่าปรับผิด"

✅ **ดี:**

- ให้ขั้นตอนเต็ม 1, 2, 3, ...

❌ **ไม่ดี:**

- "เพิ่มสมาชิกแล้วระบบมีปัญหา"

---

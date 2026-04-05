# 🛡️ Security Code Review Checklist

## 1. Input Validation & Data Sanitization
- [ ] ตัวแปรที่รับจาก `req.body`, `req.params`, `req.query` มีการตรวจสอบชนิดข้อมูล (Type Checking)
- [ ] ข้อมูลที่เป็น String ถูกทำ Sanitization ก่อนบันทึกลงฐานข้อมูลเพื่อป้องกัน XSS
- [ ] มีการกำหนดความยาวสูงสุด (Max Length) ของ Input

## 2. Authentication & Authorization
- [ ] API ที่เป็นความลับถูกป้องกันด้วย Middleware `requireAuth`
- [ ] API ที่ใช้จัดการข้อมูล (Create/Update/Delete) ถูกป้องกันด้วย `requireAdmin`
- [ ] มีการตรวจสอบสถานะของ Session / Token ว่ายังไม่หมดอายุ
- [ ] รหัสผ่าน (ถ้ามี) ไม่ควรถูกดึงออกมาแสดงผลใน API Response

## 3. Database Security (SQL Injection)
- [ ] ควบคุมการทำงานของ Database ด้วย Parameterized Queries (`?`) เสมอ
- [ ] ไม่มีการนำตัวแปรมาต่อ String (Concatenation) ลงในคำสั่ง SQL ตรงๆ

## 4. Error Handling & Logging
- [ ] มีการใช้ `try-catch` บล็อกการทำงานของ Async/Await เสมอ
- [ ] ไม่ส่ง Error Message ของ Database (เช่น ข้อมูล Table/Column) กลับไปให้ User ผ่าน Response
- [ ] ใช้ HTTP Status Code สื่อความหมายได้อย่างถูกต้อง (เช่น 400, 401, 403, 404, 409)

## 5. Business Logic & Access Control
- [ ] ตรวจสอบว่าผู้ใช้งานไม่สามารถแก้ไขข้อมูลของผู้ใช้อื่นได้ (เช่น Member อัปเดตข้อมูลตัวเองเท่านั้น)
- [ ] เช็ค Rate Limit เพื่อป้องกันการทำ Brute-force Attack (เช่น การ Login)

---
**ผู้ตรวจสอบ:** ______________________
**วันที่ประเมิน:** ______________________
# MindBot Backend Developer Test

## Context

คุณได้รับมอบหมายให้พัฒนาส่วนหนึ่งของ **Hotel Booking System**  
ระบบนี้ต้องรองรับลูกค้าที่จองห้องแบบ real-time โดยไม่ให้เกิด **double booking**

---

## Environment Setup

```bash
docker compose up --build
```

API รันที่ `http://localhost:3000`  
Database: `postgres://postgres:postgres@localhost:5432/booking`

---

## สิ่งที่ต้องทำ

### 1. Database Schema

- ออกแบบ schema สำหรับ `rooms` และ `reservations`
- ป้องกันไม่ให้มีการจองห้องซ้ำในช่วงเวลาเดียวกัน

### 2. API

- `POST /reservations`

  - รับ body:
    ```json
    {
      "room_id": 101,
      "check_in": "2025-10-01",
      "check_out": "2025-10-05"
    }
    ```
  - ถ้าห้องว่าง → สร้าง reservation
  - ถ้าห้องไม่ว่าง → ตอบ `409 Conflict`

- ต้อง handle **concurrent request** ให้ไม่เกิด double booking

### 3. Testing

- เขียน integration tests ใน `tests/`

### 4. Dockerize

- ใช้ docker-compose เพื่อรัน PostgreSQL และ API
- สร้าง Dockerfile สำหรับ API ที่ติดตั้ง dependency ทั้งหมดและรัน server ได้

### 5. Git

- สร้าง branch และ commit งานอย่างเหมาะสม

### 6. Documentation

- อธิบายใน `README.md` ว่า
  - ออกแบบ schema อย่างไร
  - ป้องกัน double booking แบบไหน
  - trade-off ที่เลือก

---

### การออกแบบ Database Schema

ระบบนี้มีตารางหลัก 2 ตารางคือ:

- **rooms**: เก็บข้อมูลห้องพัก (id, name)
- **reservations**: เก็บข้อมูลการจอง โดยอ้างอิง `room_id` จากตาราง `rooms`

รายละเอียดสำคัญ:

- ฟิลด์ `check_in` และ `check_out` มี constraint `CHECK (check_in < check_out)` เพื่อป้องกันวันเข้าพักที่ไม่ถูกต้อง
- ฟิลด์ `period` เป็นคอลัมน์ชนิด `DATERANGE` ที่ generate มาจาก `(check_in, check_out)` เพื่อให้สามารถใช้ตรวจสอบช่วงเวลาทับซ้อนกันได้สะดวก

---

### การป้องกันการจองซ้ำ (Double Booking)

เพื่อไม่ให้เกิดการจองห้องซ้ำในช่วงเวลาที่ทับกัน ใช้ **Exclusion Constraint** ของ PostgreSQL:

```sql
ALTER TABLE reservations
    ADD CONSTRAINT no_overlapping_reservations
    EXCLUDE USING GIST (
        room_id WITH =,
        period WITH &&
    );
```

การกำหนดนี้จะทำให้:

- ถ้ามีการจองห้องเดียวกัน (`room_id` เท่ากัน) และช่วงเวลาการเข้าพัก (`period`) ทับซ้อนกัน
  ระบบจะไม่อนุญาตให้ `insert` ข้อมูลใหม่และจะเกิด error

การรองรับ Concurrent Request:

- PostgreSQL จะ enforce constraint นี้ที่ระดับ Transaction
- ทำให้แม้จะมี request หลายตัวเข้ามาพร้อมกัน ก็จะไม่มีทางเกิด double booking
- API มีการดักจับ error code 23P01 และตอบกลับเป็น HTTP 409 Conflict

---

### ข้อดีและข้อเสีย (Trade-offs)

**ข้อดี** :

- ใช้ความสามารถของ PostgreSQL โดยตรง → ลดความซับซ้อนใน API
- รองรับการทำงานพร้อมกัน (concurrent) ได้อย่างปลอดภัย

**ข้อเสีย** :

- พึ่งพา feature เฉพาะของ PostgreSQL (btree_gist, daterange) ทำให้ portability ไป DB อื่นยากขึ้น
- ถ้ามีการเปลี่ยน business rule (เช่น อนุญาตให้ทับซ้อนบางกรณี) จะต้องแก้ไข constraint และ schema

---

### การทดสอบ (Testing)

ระบบมีการเขียน Integration Tests โดยใช้ node:test และ assert ครอบคลุมกรณีหลัก เช่น:

- ตรวจสอบ Healthcheck endpoint
- การสร้างการจองสำเร็จ
- การป้องกันการจองซ้ำ (double booking)
- การ reject ข้อมูลที่ไม่ถูกต้อง เช่น วันไม่ถูกต้อง หรือ parameter ไม่ครบ

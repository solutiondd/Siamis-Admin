export default {
  // ฟีเจอร์สำหรับระบบชั้นเรียน
  gradeSystem: {
    enableDisplayMapping: true, // true = แสดงชั้นเรียนแบบ NS/KG/YR ทั้งระบบ
    enableEarlyChildhoodLevels: true, // true = แสดงระดับ เตรียมอนุบาล-อนุบาล 2
    enablePrimaryLevels: true, // true = แสดงระดับ ป.1-ป.6
    enableLowerLevels: true, // legacy: true = แสดงระดับ เตรียมอนุบาล-ป.6
    enablePromoteLevel: true, // true = แสดงปุ่มเลื่อนระดับห้องเรียน
  },

  // ฟีเจอร์สำหรับคำนำหน้าชื่อ
  prefixSystem: {
    enableEnglishPrefix: true, // true = ใช้คำนำหน้าภาษาอังกฤษ (Mr., Miss, Mstr.), false = ใช้ภาษาไทย
  },

  // ฟีเจอร์สำหรับตารางเข้า-ออก
  attendance: {
    enableLineupColumn: false, // true = แสดงคอลัมน์เข้าแถว, false = ซ่อน
  },

  // ฟีเจอร์สำหรับหน้าเช็คชื่อ
  checkName: {
    // person_confirmation: ต้องมี usecase = person_confirmation
    // any_timestamp: มี timeStamps มากกว่า 0 ก็ถือว่ามา
    presentMode: "any_timestamp", // หมดการพิจารณาว่ามาแล้วหรือยังสำหรับหน้าเช็คชื่อ
    enableLeaveEdit: false, // true = แก้ไขรายการลาได้, false = ซ่อนปุ่มแก้ไข (ให้เหลือเฉพาะลบ)
  },

  // ฟีเจอร์สำหรับอุปกรณ์
  device: {
    enableUseCase: true, // true = แสดง Use Case, false = ซ่อน
  },

  // ฟีเจอร์สำหรับไลน์หน้านักเรียน
  student: {
    enableLineStatusFilter: false, // true = แสดงตัวกรองสถานะ LINE, false = ซ่อน
  },

  // ฟีเจอร์สำหรับหน้าบุคลากร
  teacher: {
    enableApiNumberColumn: false, // true = แสดงคอลัมน์เลข API (note), false = ซ่อน
  },

  // ฟีเจอร์สำหรับหน้า Home
  home: {
    enableProgress: true, // true = แสดง Progress, false = ซ่อน
  },

  // ฟีเจอร์สำหรับเมนู
  menu: {
    enableUniformInspection: true, // เมนูตรวจเครื่องแบบ
    enableReportUniformInspection: true, // เมนูรายงานตรวจระเบียบ
    enableAllowanceSetting: true, // เมนูตั้งค่าสาย
  },

  // ฟรีเจอร์ลบรายงานตรวจระเบียบ
  reportUniformInspection: {
    enableDelete: true, // true = แสดงปุ่มลบในตารางรายงานตรวจระเบียบ, false = ซ่อน
  },
};

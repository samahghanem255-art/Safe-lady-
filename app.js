// ==========================================
// SAFE LADY - MVP
// Front-end version
// ==========================================

// بيانات تجريبية
let trips = JSON.parse(localStorage.getItem("safeLadyTrips")) || [];

let driverOnline = false;
let currentTrip = null;


// ==========================================
// التنقل بين الصفحات
// ==========================================

function showPage(pageId) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  document.getElementById("mainNav").classList.remove("open");

  if (pageId === "trips") {
    renderTrips();
  }

  if (pageId === "profile") {
    updateProfile();
  }
}


// ==========================================
// القائمة في الهاتف
// ==========================================

function toggleMenu() {

  document
    .getElementById("mainNav")
    .classList.toggle("open");

}


// ==========================================
// الوضع الليلي
// ==========================================

function toggleDarkMode() {

  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem("safeLadyDarkMode", dark);

}


// استرجاع الوضع السابق
if (localStorage.getItem("safeLadyDarkMode") === "true") {
  document.body.classList.add("dark");
}


// ==========================================
// تقدير السعر
// ==========================================

const pickupInput = document.getElementById("pickup");
const destinationInput = document.getElementById("destination");

if (pickupInput) {
  pickupInput.addEventListener("input", calculatePrice);
}

if (destinationInput) {
  destinationInput.addEventListener("input", calculatePrice);
}

function calculatePrice() {

  const pickup = pickupInput.value.trim();
  const destination = destinationInput.value.trim();

  let price = 200;

  if (pickup && destination) {
    price = 250;
  }

  document.getElementById("estimatedPrice").textContent =
    price + " دج";
}


// ==========================================
// إنشاء رحلة
// ==========================================

function createTrip() {

  const pickup = document.getElementById("pickup").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const date = document.getElementById("tripDate").value;
  const time = document.getElementById("tripTime").value;
  const payment = document.getElementById("payment").value;

  if (!pickup || !destination) {

    showToast("يرجى تحديد نقطة الانطلاق والوجهة");

    return;
  }

  const price =
    pickup && destination ? 250 : 200;

  const trip = {

    id: Date.now(),

    pickup: pickup,

    destination: destination,

    date: date || new Date().toISOString().split("T")[0],

    time: time || "--:--",

    payment: payment,

    price: price,

    status: "قيد الانتظار",

    driver: "سيتم تعيين سائقة"

  };

  trips.unshift(trip);

  localStorage.setItem(
    "safeLadyTrips",
    JSON.stringify(trips)
  );

  currentTrip = trip;

  showToast("تم إرسال طلب الرحلة بنجاح ✓");

  setTimeout(() => {

    showPage("tracking");

    updateTripStatus();

  }, 700);

}


// ==========================================
// عرض الرحلات
// ==========================================

function renderTrips() {

  const container =
    document.getElementById("tripsContainer");

  if (!container) return;

  if (trips.length === 0) {

    container.innerHTML = `
      <div class="form-card">
        <h3>لا توجد رحلات حتى الآن</h3>
        <p>ابدئي بحجز أول رحلة لكِ مع Safe Lady.</p>
        <br>
        <button class="primary-btn full"
                onclick="showPage('booking')">
          حجز رحلة
        </button>
      </div>
    `;

    return;
  }

  container.innerHTML = trips.map(trip => `

    <div class="trip-card">

      <div class="trip-header">

        <strong>رحلة #${trip.id.toString().slice(-5)}</strong>

        <span class="status">
          ${trip.status}
        </span>

      </div>

      <div class="trip-route">

        <div>
          <span>📍</span>
          ${escapeHTML(trip.pickup)}
        </div>

        <div>
          <span>🏁</span>
          ${escapeHTML(trip.destination)}
        </div>

      </div>

      <p>
        📅 ${trip.date}
        &nbsp;&nbsp;
        🕐 ${trip.time}
      </p>

      <p>
        💳 ${trip.payment === "cash"
          ? "الدفع نقدًا"
          : "دفع إلكتروني"}
      </p>

      <h3>${trip.price} دج</h3>

      ${
        trip.status !== "مكتملة"
        ?
        `<button
          class="primary-btn"
          onclick="openTrip(${trip.id})">
          متابعة الرحلة
        </button>`
        :
        `<button
          class="secondary-btn"
          onclick="rateTrip(${trip.id})">
          ⭐ تقييم الرحلة
        </button>`
      }

    </div>

  `).join("");

}


// ==========================================
// فتح رحلة
// ==========================================

function openTrip(id) {

  currentTrip =
    trips.find(trip => trip.id === id);

  if (!currentTrip) return;

  showPage("tracking");

  updateTripStatus();

}


// ==========================================
// محاكاة حالة الرحلة
// ==========================================

function updateTripStatus() {

  const status =
    document.getElementById("tripStatus");

  if (!status) return;

  status.textContent =
    "السائقة في الطريق إليك 🚗";

}


// ==========================================
// إنهاء الرحلة
// ==========================================

function finishTrip() {

  if (!currentTrip) {

    showToast("لا توجد رحلة نشطة");

    return;
  }

  const index =
    trips.findIndex(
      trip => trip.id === currentTrip.id
    );

  if (index !== -1) {

    trips[index].status = "مكتملة";

    trips[index].driver = "سارة";

    localStorage.setItem(
      "safeLadyTrips",
      JSON.stringify(trips)
    );

  }

  showToast("تم إنهاء الرحلة بنجاح ✓");

  setTimeout(() => {

    showPage("trips");

    rateTrip(currentTrip.id);

  }, 700);

}


// ==========================================
// تقييم الرحلة
// ==========================================

function rateTrip(id) {

  const rating =
    prompt("قيّمي الرحلة من 1 إلى 5 ⭐");

  if (!rating) return;

  const value = Number(rating);

  if (value >= 1 && value <= 5) {

    showToast(
      `شكرًا لكِ! تم تسجيل تقييم ${value}/5 ⭐`
    );

  } else {

    showToast(
      "يرجى إدخال رقم بين 1 و5"
    );

  }

}


// ==========================================
// SOS
// ==========================================

function activateSOS() {

  document
    .getElementById("sosModal")
    .classList.add("show");

}


function confirmSOS() {

  closeModal("sosModal");

  showToast(
    "🚨 تم تسجيل حالة الطوارئ. سيتم التواصل مع الدعم."
  );

}


function closeModal(id) {

  document
    .getElementById(id)
    .classList.remove("show");

}


// ==========================================
// مشاركة الرحلة
// ==========================================

function shareTrip() {

  const text =
    "أنا في رحلة مع Safe Lady. يمكنك متابعة رحلتي.";

  if (navigator.share) {

    navigator.share({
      title: "Safe Lady",
      text: text
    }).catch(() => {});

  } else {

    navigator.clipboard.writeText(text);

    showToast(
      "تم نسخ معلومات الرحلة للمشاركة"
    );

  }

}


// ==========================================
// الدعم
// ==========================================

function showSupport() {

  showToast(
    "سيتم توفير مركز دعم Safe Lady في النسخة المتصلة."
  );

}


// ==========================================
// واجهة السائقة
// ==========================================

function toggleDriverStatus() {

  driverOnline = !driverOnline;

  const status =
    document.getElementById("driverStatus");

  const button =
    document.getElementById("onlineButton");

  if (driverOnline) {

    status.textContent =
      "أنتِ متاحة لاستقبال الرحلات";

    button.textContent = "إيقاف";

    showToast(
      "أصبحتِ متاحة لاستقبال الرحلات"
    );

  } else {

    status.textContent =
      "أنتِ غير متاحة حاليًا";

    button.textContent = "تشغيل";

    showToast(
      "تم إيقاف استقبال الرحلات"
    );

  }

}


// ==========================================
// قبول طلب رحلة
// ==========================================

function acceptRequest(button) {

  const card =
    button.closest(".request-card");

  card.innerHTML = `

    <div>

      <strong>✓ تم قبول الرحلة</strong>

      <p>
        الرحلة أصبحت ضمن رحلاتك.
      </p>

    </div>

    <span class="status">
      مقبولة
    </span>

  `;

  showToast(
    "تم قبول الرحلة ✓"
  );

}


// ==========================================
// رفض طلب رحلة
// ==========================================

function rejectRequest(button) {

  const card =
    button.closest(".request-card");

  card.remove();

  showToast(
    "تم رفض طلب الرحلة"
  );

}


// ==========================================
// الملف الشخصي
// ==========================================

function updateProfile() {

  const profileTrips =
    document.getElementById("profileTrips");

  if (profileTrips) {

    profileTrips.textContent =
      trips.length;

  }

}


function editProfile() {

  const name =
    prompt(
      "أدخلي اسمك الجديد:"
    );

  if (name && name.trim()) {

    showToast(
      "تم تحديث الاسم بنجاح ✓"
    );

  }

}


// ==========================================
// Toast
// ==========================================

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 3000);

}


// ==========================================
// حماية النصوص من HTML
// ==========================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


// ==========================================
// تحديث لوحة الإدارة
// ==========================================

function updateAdmin() {

  const adminTrips =
    document.getElementById("adminTrips");

  if (adminTrips) {

    adminTrips.textContent =
      Math.max(86, trips.length);

  }

}


// ==========================================
// عند تحميل التطبيق
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderTrips();

    updateProfile();

    updateAdmin();

  }
);

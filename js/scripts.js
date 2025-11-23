const SUPABASE_URL = 'https://sswbswainknbkhdpitqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd2Jzd2FpbmtuYmtoZHBpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTU4NDgsImV4cCI6MjA3OTAzMTg0OH0.lWIrilecuOgLQOjYzyfhZxNevd8F6l-KynukUV8Odt0';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1) Restaurar año en footer (opcional)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 6) Menú y ventanas (tu lógica original, sin cambios)
function toggleMenu() {
  const ul = document.getElementById('navLinks');
  if (!ul) return;
  ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
}

function toggleMasMenu() {
  const submenu = document.getElementById('masSubmenu');
  if (!submenu) return;
  submenu.classList.toggle('hidden');
}

function mostrarQuienesSomos() {
  const overlay = document.getElementById('overlay');
  const texto = document.getElementById('textoQuienesSomos');
  if (!overlay || !texto) return;

  const contenido = `QUIÉNES SOMOS – DIPTE CREACIONES

DIPTE Creaciones nació el 8 de marzo de 2023 como un emprendimiento familiar con una misión sencilla pero poderosa: transformar momentos especiales en recuerdos inolvidables. Desde nuestra casa convertida en taller creativo, diseñamos y elaboramos decoraciones personalizadas para todo tipo de eventos: cumpleaños, 15 años, graduaciones, bautizos, comuniones, confirmaciones, bodas y celebraciones especiales.

Con dedicación, creatividad y un toque artesanal, nos especializamos en montar ambientes llenos de color, estilo y armonía, cuidando cada detalle para que el resultado final hable por sí solo. También elaboramos detalles personalizados para regalar, ideales para sorprender, enamorar o agradecer.

Nuestro trabajo está guiado por valores que nos representan: responsabilidad, compromiso, puntualidad y una atención cálida que brinda confianza a cada cliente que deposita sus momentos importantes en nuestras manos.

En DIPTE Creaciones, cada proyecto es único, porque entendemos que cada celebración tiene su propia historia… y nos encanta formar parte de ella.`;

  overlay.classList.remove('hidden');
  texto.textContent = '';
  texto.style.opacity = 1;

  let i = 0;
  const velocidad = 20;
  (function escribir() {
    if (i < contenido.length) {
      texto.textContent += contenido.charAt(i++);
      setTimeout(escribir, velocidad);
    }
  })();
}

document.getElementById('overlay')?.addEventListener('click', () => {
  document.getElementById('overlay')?.classList.add('hidden');
});

function abrirVentana(tipo) {
  cerrarVentanas();
  if (tipo === 'valores') {
    document.getElementById('ventanaValores')?.classList.remove('hidden');
  } else if (tipo === 'ofrecemos') {
    document.getElementById('ventanaOfrecemos')?.classList.remove('hidden');
  }
}

function cerrarVentanas() {
  document.getElementById('ventanaValores')?.classList.add('hidden');
  document.getElementById('ventanaOfrecemos')?.classList.add('hidden');
}

// 7) Upload (si usas #uploadArea)
const imageInput = document.getElementById('imageInput');
if (imageInput) {
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const uploadArea = document.getElementById('uploadArea');
      if (!uploadArea) return;
      uploadArea.innerHTML = '';
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.alt = 'Imagen subida de ejemplo';
      uploadArea.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}
// ========================
// 8) Roles y permisos
// ========================

// Aplica visibilidad de botones según rol
function applyRoleUI() {
  const role = localStorage.getItem('userRole') || 'user';

  const agregarBtn = document.getElementById('agregarProductoBtn');
  if (agregarBtn) {
    agregarBtn.style.display = role === 'admin' ? 'inline-block' : 'none';
  }

  const rolesBtn = document.getElementById('administrarRolesBtn');
  if (rolesBtn) {
    rolesBtn.style.display = role === 'admin' ? 'inline-block' : 'none';
  }
}

// Renderiza el bloque de usuario en el header y aplica roles
function renderUserUI(name, imageUrl) {
  const brand = document.querySelector('.brand');
  if (!brand) return;

  // Oculta el botón de login si existe
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.style.display = 'none';

  // Oculta botones de Google si existen
  const gOnload = document.getElementById('g_id_onload');
  const gSignIn = document.querySelector('.g_id_signin');
  if (gOnload) gOnload.style.display = 'none';
  if (gSignIn) gSignIn.style.display = 'none';

  let existing = brand.querySelector('.user-block');
  if (!existing) {
    existing = document.createElement('div');
    existing.className = 'user-block';
    existing.style.display = 'inline-flex';
    existing.style.alignItems = 'center';
    existing.style.gap = '8px';
    brand.appendChild(existing);
  } else {
    existing.innerHTML = '';
  }

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
console.log('URL de imagen:', imageUrl);

  const img = document.createElement('img');
img.src = imageUrl && imageUrl.startsWith('http') ? imageUrl : 'img/default.png';
img.style.opacity = 0;
setTimeout(() => {
  img.style.opacity = 1;
}, 100);


  img.alt = name;
  avatar.innerHTML = '';

  avatar.appendChild(img);

  const saludo = document.createElement('span');
  saludo.className = 'saludo';
  saludo.textContent = `Bienvenido ${name}`;
  saludo.style.color = '#ffffff';

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'logout-btn hidden';
  logoutBtn.textContent = 'Cerrar sesión';

  avatar.style.cursor = 'pointer';
  avatar.onclick = () => {
    logoutBtn.classList.toggle('visible');
    logoutBtn.classList.toggle('hidden');
  };

  logoutBtn.onclick = async () => {
    await sb.auth.signOut();
    localStorage.clear();
    location.reload();
  };

  existing.appendChild(avatar);
  existing.appendChild(saludo);
  existing.appendChild(logoutBtn);

  applyRoleUI();
}

// ========================
// 9) Proteger páginas admin
// ========================
function protectAdminPage() {
  const role = localStorage.getItem('userRole');
  if (role !== 'admin') {
    alert('Acceso restringido. Solo administradores pueden agregar productos.');
    window.location.href = 'index.html';
  }
}

// ========================
// 10) Login con Supabase
// ========================
async function loginConSupabase() {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'http://localhost:5500/index.html' } // ajusta según tu entorno
  });
  if (error) console.error('Error al iniciar sesión:', error.message);
}

// ========================
// 11) Restaurar sesión al cargar
// ========================
async function resolveRoleFromDB(email) {
  const { data, error } = await sb
    .from('users_roles')
    .select('role')
    .eq('email', email)
    .single();

  if (error || !data) {
    console.warn('Rol no encontrado, asignando "user".', error);
    return 'user';
  }

  return data.role;
}

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await sb.auth.getSession();

  if (error) {
    console.error('Error al obtener sesión:', error.message);
    applyRoleUI();
    return;
  }

  if (session?.user) {
    const name = session.user.user_metadata?.name || 'Usuario';
    const imageUrl = session.user.user_metadata?.avatar_url || 'img/default.png';
    const email = session.user.email;

    const role = await resolveRoleFromDB(email); // ✅ consulta real desde Supabase

    localStorage.setItem('userName', name);
    localStorage.setItem('userImage', imageUrl);
    localStorage.setItem('userRole', role);

    renderUserUI(name, imageUrl);
  } else {
    applyRoleUI();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

function toggleMenu(){
  const ul = document.getElementById('navLinks');
  ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
}

function agregarSeccion(){
  const nombre = prompt('Nombre de la nueva sección (ej: Galería)');
  if(!nombre) return;
  const href = prompt('Archivo o enlace para la sección (ej: galeria.html o https://...)', '#');
  const ul = document.getElementById('navLinks');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = href || '#';
  a.textContent = nombre;
  li.appendChild(a);
  ul.appendChild(li);
  a.scrollIntoView({behavior:'smooth',block:'center'});
}

function openUpload(){
  document.getElementById('imageInput').click();
}

const input = document.getElementById('imageInput');
input.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = '';
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.alt = 'Imagen subida de ejemplo';
    uploadArea.appendChild(img);
  }
  reader.readAsDataURL(file);
});

const CLIENT_ID = '1051129239562-kjqnel8ib15nqs8g28rhg17vqk55gp2a.apps.googleusercontent.com';

function loginConGoogle() {
  gapi.load('auth2', () => {
    const auth2 = gapi.auth2.init({ client_id: CLIENT_ID });
    auth2.signIn().then(googleUser => {
      const profile = googleUser.getBasicProfile();
      const name = profile.getName();
      const imageUrl = profile.getImageUrl();

      // Guardar datos en localStorage
      localStorage.setItem('userName', name);
      localStorage.setItem('userImage', imageUrl);

      renderUserUI(name, imageUrl);
    }).catch(err => {
      alert("Error al iniciar sesión: " + err.error);
      console.error(err);
    });
  });
}

// ÚNICA función para manejar login con Google Identity (GSI)
function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  const name = data.name;
  const imageUrl = data.picture;

  // Guardar datos en localStorage
  localStorage.setItem('userName', name);
  localStorage.setItem('userImage', imageUrl);

  renderUserUI(name, imageUrl);
}

// Renderizar UI personalizada y ocultar botón de login
function renderUserUI(name, imageUrl) {
  const brand = document.querySelector('.brand');
  brand.innerHTML = ''; // Limpiar contenido anterior

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.style.cursor = 'pointer';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = name;
  avatar.appendChild(img);

  const saludo = document.createElement('span');
  saludo.className = 'saludo';
  saludo.textContent = `Bienvenido ${name}`;

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'logout-btn hidden';
  logoutBtn.textContent = 'Cerrar sesión';
logoutBtn.onclick = () => {
  if (window.sb) {
    logoutSupabase(); // cerrar sesión en Supabase
  } else {
    localStorage.clear(); // Borrar datos guardados
    if (window.google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    location.reload(); // Recargar para volver al estado inicial
  }
};
  avatar.onclick = () => {
    logoutBtn.classList.toggle('visible');
    logoutBtn.classList.toggle('hidden');
  };

  brand.appendChild(avatar);
  brand.appendChild(saludo);
  brand.appendChild(logoutBtn);

  // Ocultar el botón de login de Google si existe
  const googleBtn = document.querySelector('.g_id_signin');
  if (googleBtn) {
    googleBtn.style.display = 'none';
  }
  const legacyBtn = document.querySelector('.login-btn');
  if (legacyBtn) {
    legacyBtn.style.display = 'none';
  }
}

// Al cargar la página, revisar si hay sesión guardada (localStorage)
window.onload = () => {
  const name = localStorage.getItem('userName');
  const imageUrl = localStorage.getItem('userImage');

  if (name && imageUrl) {
    renderUserUI(name, imageUrl);
  }
};

function toggleMasMenu() {
  const submenu = document.getElementById('masSubmenu');
  submenu.classList.toggle('hidden');
}

function mostrarQuienesSomos() {
  const overlay = document.getElementById('overlay');
  const texto = document.getElementById('textoQuienesSomos');
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
  const escribir = () => {
    if (i < contenido.length) {
      texto.textContent += contenido.charAt(i);
      i++;
      setTimeout(escribir, velocidad);
    }
  };
  escribir();
}

// Opcional: cerrar al hacer clic fuera
document.getElementById('overlay').addEventListener('click', () => {
  document.getElementById('overlay').classList.add('hidden');
});

function abrirVentana(tipo) {
  cerrarVentanas();
  if (tipo === 'valores') {
    document.getElementById('ventanaValores').classList.remove('hidden');
  } else if (tipo === 'ofrecemos') {
    document.getElementById('ventanaOfrecemos').classList.remove('hidden');
  }
}

function cerrarVentanas() {
  document.getElementById('ventanaValores').classList.add('hidden');
  document.getElementById('ventanaOfrecemos').classList.add('hidden');
}

// Cerrar al hacer clic fuera
document.getElementById('ventanaValores').addEventListener('click', cerrarVentanas);
document.getElementById('ventanaOfrecemos').addEventListener('click', cerrarVentanas);

// Supabase
const SUPABASE_URL = 'https://sswbswainknbkhdpitqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd2Jzd2FpbmtuYmtoZHBpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTU4NDgsImV4cCI6MjA3OTAzMTg0OH0.lWIrilecuOgLQOjYzyfhZxNevd8F6l-KynukUV8Odt0';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Botón de login con Google (Supabase)
async function loginSupabaseGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin // vuelve aquí después de login
    }
  });
  if (error) {
    console.error('Login error:', error.message);
    alert('No se pudo iniciar sesión. Intenta de nuevo.');
  }
}

// Ver sesión al cargar y renderizar UI
async function checkSupabaseSession() {
  const { data } = await sb.auth.getSession();
  const session = data?.session;
  if (session?.user) {
    const name = session.user.user_metadata?.name || 'Usuario';
    const imageUrl = session.user.user_metadata?.picture;

    // Oculta tu botón de login de Google (si existe)
    const googleBtn = document.querySelector('.g_id_signin, .login-btn');
    if (googleBtn) googleBtn.style.display = 'none';

    // Renderiza tu UI
    renderUserUI(name, imageUrl);

    // Refleja en localStorage para tu flujo actual
    localStorage.setItem('userName', name);
    localStorage.setItem('userImage', imageUrl);
  }
}

// Cerrar sesión Supabase
async function logoutSupabase() {
  await sb.auth.signOut();
  localStorage.clear();
  location.reload();
}

// Arranque
window.addEventListener('load', checkSupabaseSession);

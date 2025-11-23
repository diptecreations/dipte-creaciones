const SUPABASE_URL = 'https://sswbswainknbkhdpitqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd2Jzd2FpbmtuYmtoZHBpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTU4NDgsImV4cCI6MjA3OTAzMTg0OH0.lWIrilecuOgLQOjYzyfhZxNevd8F6l-KynukUV8Odt0';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== Login con Supabase ==========
async function loginConSupabase() {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href }
  });
  if (error) console.error('Error al iniciar sesión:', error.message);
}

// ========== Renderizar usuario en el header ==========
function renderUserUI(name, imageUrl) {
  const brand = document.querySelector('.brand');
  if (!brand) return;

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.style.display = 'none';

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

  const img = document.createElement('img');
  img.src = imageUrl && imageUrl.startsWith('http') ? imageUrl : 'img/default.png';
  img.alt = name;
  img.style.width = '32px';
  img.style.height = '32px';
  img.style.borderRadius = '50%';

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
    location.href = 'index.html';
  };

  existing.appendChild(avatar);
  existing.appendChild(saludo);
  existing.appendChild(logoutBtn);
}

// ========== Restaurar sesión ==========
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await sb.auth.getSession();
  if (error || !session?.user) {
    alert('Debes iniciar sesión para agregar productos.');
    window.location.href = 'index.html';
    return;
  }

  const name = session.user.user_metadata?.name || 'Usuario';
  const imageUrl = session.user.user_metadata?.avatar_url || 'img/default.png';
  renderUserUI(name, imageUrl);
});

// ========== Vista previa de imágenes ==========
const imagenInput = document.getElementById('imagen');
const miniaturas = document.getElementById('miniaturas');

imagenInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  miniaturas.innerHTML = '';

  files.forEach((file) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const div = document.createElement('div');
      div.className = 'miniatura';
      div.innerHTML = `<img src="${reader.result}" alt="Vista previa">`;
      miniaturas.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
});

// ========== Guardar producto ==========
const form = document.getElementById('productoForm');
const mensaje = document.getElementById('mensajeProducto');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensaje.textContent = '';
  mensaje.style.color = 'inherit';

  const { data: { session }, error: sessionError } = await sb.auth.getSession();
  if (sessionError || !session?.user) {
    mensaje.textContent = 'Debes iniciar sesión para guardar productos.';
    mensaje.style.color = 'red';
    return;
  }

  const titulo = document.getElementById('titulo').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
    const descripcion = document.getElementById('descripcion').value.trim();
  const categoria = document.getElementById('categoria').value;
const files = Array.from(imagenInput.files);

if (!titulo || !precio || !descripcion || !categoria || files.length === 0) {
  mensaje.textContent = 'Completa todos los campos.';
  mensaje.style.color = 'red';
  return;
}

// Convertir todas las imágenes a base64
const base64Promises = files.map(file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
});

try {
  const base64Images = await Promise.all(base64Promises);
  const imagen_url = base64Images.join('|||'); // separador personalizado

  const { error: insertError } = await sb
    .from('productos')
    .insert([{ titulo, precio, descripcion, categoria, imagen_url }]);

  if (insertError) {
    console.error('Insert error:', insertError);
    mensaje.textContent = 'Error al guardar producto.';
    mensaje.style.color = 'red';
    return;
  }

  mensaje.textContent = '✅ Producto guardado correctamente.';
  mensaje.style.color = 'green';

  setTimeout(() => {
    window.location.href = `${categoria}.html`;
  }, 1200);
} catch (error) {
  console.error('Error al procesar imágenes:', error);
  mensaje.textContent = 'Error al procesar imágenes.';
  mensaje.style.color = 'red';
}

});

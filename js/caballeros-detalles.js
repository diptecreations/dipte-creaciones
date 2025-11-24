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

function toggleMasMenu(event) {
  event.stopPropagation();
  const submenu = document.getElementById('masSubmenu');
  const menuWrapper = document.querySelector('.mas-menu');
  if (!submenu || !menuWrapper) return;

  submenu.classList.toggle('hidden');
  menuWrapper.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const submenu = document.getElementById('masSubmenu');
  const menuWrapper = document.querySelector('.mas-menu');
  if (!submenu || !menuWrapper) return;

  if (!menuWrapper.contains(e.target)) {
    submenu.classList.add('hidden');
    menuWrapper.classList.remove('open');
  }
});

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

// ========== Cargar productos ==========
async function cargarProductos() {
  const galeria = document.getElementById('galeriaProductos');

  const { data, error } = await sb
    .from('productos')
    .select('*')
    .eq('categoria', 'caballeros-detalles')   // 🔥 Adaptado a caballeros-detalles
    .order('created_at', { ascending: false });

  console.log('Productos recibidos:', data);

  if (error) {
    galeria.innerHTML = '<p>Error al cargar productos.</p>';
    console.error(error.message);
    return;
  }

  if (!data || data.length === 0) {
    galeria.innerHTML = '<p>No hay productos disponibles aún.</p>';
    return;
  }
  window.productos = data;

  data.forEach((producto) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';
    tarjeta.style.position = 'relative';

    const role = localStorage.getItem('userRole') || 'anon';
    const raw = producto.imagen_url?.trim() || '';
    const imagenes = raw.includes('|||')
      ? raw.split('|||').map(img => img.trim()).filter(img => img.startsWith('data:image'))
      : [raw];

    const imagen = imagenes[0] || 'img/default.png';
    tarjeta.innerHTML = `
      <div class="tarjeta-contenido">
        <div class="imagen-wrapper">
          <img src="${imagen}" alt="${producto.titulo}" onclick="expandirTarjeta('${producto.id}')">
          <div class="info-basica" onclick="expandirTarjeta('${producto.id}')">
            <h3>${producto.titulo}</h3>
            <p>$${producto.precio}</p>
          </div>
          <div class="overlay" onclick="expandirTarjeta('${producto.id}')">
            <span>Ver más</span>
          </div>
        </div>

        ${role === 'admin' ? `
          <div class="menu-admin" onclick="event.stopPropagation()">
            <button class="menu-btn" onclick="toggleMenu('${producto.id}'); event.stopPropagation();">⋮</button>
            <div id="menu-${producto.id}" class="menu-opciones hidden">
              <button onclick="actualizarProducto('${producto.id}'); event.stopPropagation();">Actualizar</button>
              <button onclick="eliminarProducto('${producto.id}'); event.stopPropagation();">Eliminar</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
    galeria.appendChild(tarjeta);
  });
}

// ========== Funciones globales para menú ==========
function toggleMenu(id) {
  const menu = document.getElementById(`menu-${id}`);
  if (menu) {
    menu.classList.toggle('hidden');
    menu.classList.toggle('visible');
  }
}
let productoActualId = null;

function actualizarProducto(id) {
  const producto = window.productos.find(p => p.id === id);
  if (!producto) return;

  productoActualId = id;
  document.getElementById('tituloActualizar').value = producto.titulo;
  document.getElementById('precioActualizar').value = producto.precio;
  document.getElementById('descripcionActualizar').value = producto.descripcion;

  document.getElementById('modalActualizar').classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modalActualizar').classList.add('hidden');
  productoActualId = null;
}
document.getElementById('formActualizar').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!productoActualId) return;

  const titulo = document.getElementById('tituloActualizar').value.trim();
  const precio = parseFloat(document.getElementById('precioActualizar').value);
  const descripcion = document.getElementById('descripcionActualizar').value.trim();

  const { error } = await sb
    .from('productos')
    .update({ titulo, precio, descripcion })
    .eq('id', productoActualId);

  if (error) {
    alert('Error al actualizar producto.');
    console.error(error.message);
  } else {
    alert('✅ Producto actualizado correctamente.');
    cerrarModal();
    location.reload();
  }
});

async function eliminarProducto(id) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar este producto?');
  if (!confirmar) return;

  const { data: { session }, error: sessionError } = await sb.auth.getSession();
  if (sessionError || !session?.user) {
    alert('Debes iniciar sesión para eliminar productos.');
    return;
  }

  const { error } = await sb
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Error al eliminar producto.');
    console.error(error.message);
  } else {
    alert('✅ Producto eliminado correctamente.');
    location.reload();
  }
}

// ========== Restaurar sesión si existe ==========
document.addEventListener('DOMContentLoaded', async () => {
  let role = 'anon';

  const { data: { session }, error } = await sb.auth.getSession();
  const user = session?.user || null;

  if (user) {
    const name = user.user_metadata?.name || 'Usuario';
    const imageUrl = user.user_metadata?.avatar_url || 'img/default.png';
    const email = user.email;

    const { data: rolData, error: rolError } = await sb
      .from('users_roles')
      .select('role')
      .eq('email', email)
      .single();

    role = rolData?.role || 'user';
    localStorage.setItem('userRole', role);
    renderUserUI(name, imageUrl);
  }

  // Ocultar opciones de admin si no es administrador
  if (role !== 'admin') {
    const adminOpcionesProducto = document.getElementById('adminOpcionesProducto');
    const adminOpcionesRoles = document.getElementById('adminOpcionesRoles');

    if (adminOpcionesProducto) adminOpcionesProducto.style.display = 'none';
    if (adminOpcionesRoles) adminOpcionesRoles.style.display = 'none';
  }

  await cargarProductos();
});

// ========== Expandir tarjeta ==========
function expandirTarjeta(id) {
  const producto = window.productos.find(p => p.id === id);
  if (!producto) return;

  const raw = producto.imagen_url?.trim() || '';
  const imagenes = raw.includes('|||')
    ? raw.split('|||').map(img => img.trim()).filter(img => img.startsWith('data:image'))
    : [raw];

  if (imagenes.length === 0) {
    imagenes.push('img/default.png');
  }

  let index = 0;
  const imgElement = document.getElementById('expandidaImagen');
  imgElement.src = imagenes[index];

  clearInterval(window.carruselInterval);
  if (imagenes.length > 1) {
    window.carruselInterval = setInterval(() => {
      index = (index + 1) % imagenes.length;
      imgElement.src = imagenes[index];
    }, 2500);
  }

  document.getElementById('expandidaTitulo').textContent = producto.titulo;
  document.getElementById('expandidaPrecio').textContent = `$${producto.precio}`;
  document.getElementById('expandidaDescripcion').textContent = producto.descripcion;

  const modal = document.getElementById('tarjetaExpandida');
  modal.style.display = 'flex';
  modal.classList.add('animar-expandido');
}

function cerrarTarjetaExpandida() {
  clearInterval(window.carruselInterval);
  const modal = document.getElementById('tarjetaExpandida');
  modal.style.display = 'none';
  modal.classList.remove('animar-expandido');
}
function irAlForo() {
  window.location.href = 'foro.html';
}

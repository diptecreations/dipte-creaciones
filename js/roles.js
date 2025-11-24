const SUPABASE_URL = 'https://sswbswainknbkhdpitqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzd2Jzd2FpbmtuYmtoZHBpdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTU4NDgsImV4cCI6MjA3OTAzMTg0OH0.lWIrilecuOgLQOjYzyfhZxNevd8F6l-KynukUV8Odt0';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================
// 1) Resolver rol desde BD
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

// ========================
// 2) Renderizar usuario en el header
// ========================
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

// ========================
// 3) Cargar administradores
// ========================
async function cargarAdministradores() {
  const { data, error } = await sb
    .from('users_roles')
    .select('*')
    .eq('role', 'admin');

  const tbody = document.querySelector('#tablaAdmins tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (error || !data) return;

  data.forEach((admin) => {
    const tr = document.createElement('tr');

    const tdCorreo = document.createElement('td');
    tdCorreo.textContent = admin.email;

    const tdAcciones = document.createElement('td');

    const editarBtn = document.createElement('button');
    editarBtn.textContent = 'Editar';
    editarBtn.onclick = () => editarAdmin(admin.email);

    const eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.onclick = () => eliminarAdmin(admin.email);

    tdAcciones.appendChild(editarBtn);
    tdAcciones.appendChild(eliminarBtn);

    tr.appendChild(tdCorreo);
    tr.appendChild(tdAcciones);
    tbody.appendChild(tr);
  });
}

// ========================
// 4) Eliminar administrador
// ========================
async function eliminarAdmin(email) {
  const { data: admins, error } = await sb
    .from('users_roles')
    .select('email')
    .eq('role', 'admin');

  if (error || !admins) {
    alert('Error al verificar administradores.');
    console.error(error?.message);
    return;
  }

  if (admins.length <= 1) {
    alert('❌ No se puede eliminar el último administrador.');
    return;
  }

  const { error: deleteError } = await sb
    .from('users_roles')
    .delete()
    .eq('email', email);

  if (deleteError) {
    alert('Error al eliminar administrador.');
    console.error(deleteError.message);
  } else {
    alert(`✅ Administrador ${email} eliminado.`);
    cargarAdministradores();
  }
}

// ========================
// 5) Editar administrador
// ========================
async function editarAdmin(emailOriginal) {
  const nuevoCorreo = prompt('Nuevo correo para este administrador:', emailOriginal);
  if (!nuevoCorreo || !nuevoCorreo.endsWith('@gmail.com')) {
    alert('Solo se permiten correos @gmail.com');
    return;
  }

  const { error } = await sb
    .from('users_roles')
    .update({ email: nuevoCorreo })
    .eq('email', emailOriginal);

  if (error) {
    alert('Error al actualizar correo.');
    console.error(error.message);
  } else {
    alert('Correo actualizado.');
    cargarAdministradores();
  }
}

// ========================
// 6) Login con Supabase
// ========================
async function loginConSupabase() {
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://diptecreations.github.io/roles.html' }
  });
  if (error) console.error('Error al iniciar sesión:', error.message);
}

// ========================
// 7) Restaurar sesión y proteger acceso
// ========================
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error } = await sb.auth.getSession();

  if (error || !session?.user) {
    alert('No tienes sesión activa. Inicia sesión como administrador.');
    window.location.href = 'index.html';
    return;
  }

  const name = session.user.user_metadata?.name || 'Usuario';
  const imageUrl = session.user.user_metadata?.avatar_url || 'img/default.png';
  const email = session.user.email;

  const role = await resolveRoleFromDB(email);
  if (role !== 'admin') {
    alert('Acceso denegado. Solo administradores pueden gestionar roles.');
    window.location.href = 'index.html';
    return;
  }

  localStorage.setItem('userName', name);
  localStorage.setItem('userImage', imageUrl);
  localStorage.setItem('userRole', role);

  renderUserUI(name, imageUrl);
  cargarAdministradores();

  const form = document.getElementById('adminForm');
  const mensaje = document.getElementById('mensajeRol');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('correoAdmin').value.trim().toLowerCase();
    if (!correo.endsWith('@gmail.com')) {
      mensaje.textContent = 'Solo se permiten correos @gmail.com';
      mensaje.style.color = 'red';
      return;
    }

    const { error } = await sb
      .from('users_roles')
      .upsert({ email: correo, role: 'admin' }, { onConflict: ['email'] });

    if (error) {
      mensaje.textContent = 'Error al guardar el rol.';
      mensaje.style.color = 'red';
      console.error('Supabase error:', error.message);
    } else {
      mensaje.textContent = `✅ El correo ${correo} ahora tiene rol de administrador.`;
      mensaje.style.color = 'green';
      form.reset();
      cargarAdministradores();
    }
  });
});

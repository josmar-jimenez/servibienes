const PROVINCIAS = ["Barcelona","Girona","Lérida","Tarragona"];

const fmt = n => n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});

// llenar selects
const selProv = document.getElementById('province');
PROVINCIAS.forEach(p => {
  const o = document.createElement('option');
  o.textContent = p;
  selProv.appendChild(o);
});

// selects rápidos
const priceQuick = document.getElementById('price-quick');
for(let v=50000;v<=1000000;v+=50000){
  const o=document.createElement('option');
  o.value=v;
  o.textContent=v.toLocaleString('es-ES');
  priceQuick.appendChild(o);
}
const btn = document.getElementById('price-btn');

btn.addEventListener('click', () => {
  priceQuick.focus();  // abre el desplegable
});

priceQuick.addEventListener('change', () => {
  document.getElementById('priceProperty').value=priceQuick.value;
  priceQuick.blur(); // cierra el desplegable
});

const downQuick=document.getElementById('entrance-quick');
for(let v=25000;v<=200000;v+=25000){
  const o=document.createElement('option');
  o.value=v;
  o.textContent=v.toLocaleString('es-ES');
  downQuick.appendChild(o);
}

const btn2 = document.getElementById('entrance-btn');

btn2.addEventListener('click', () => {
  downQuick.focus();  // abre el desplegable
});

downQuick.addEventListener('change', () => {
  document.getElementById('entrance').value=downQuick.value;
  downQuick.blur(); // cierra el desplegable
});

function calcular(prestamo,tasaAnual,anos){
  const n=anos*12;
  const r=tasaAnual/100/12;
  if(r===0) return prestamo/n;
  return prestamo*r/(1-Math.pow(1+r,-n));
}
function getTipo(){
  const radios=document.getElementsByName('tipo');
  for(const r of radios) if(r.checked) return r.value;
  return 'fixed';
}

function calcularGastosYImpuestos(precio,prestamo){
  const impuesto = 0;
  const notaria = 0;
  const tasacion = 0;
  const totalGastos = impuesto + notaria + tasacion;
  const total = precio + totalGastos;
  return {impuesto,notaria,tasacion,totalGastos,total};
}

function update(){
  const price=parseFloat(document.getElementById('priceProperty').value)||0;
  const down=parseFloat(document.getElementById('entrance').value)||0;
  const years=parseInt(document.getElementById('years').value)||1;
  const rate=parseFloat(document.getElementById('rate').value)||0;
  const province=document.getElementById('province').value;
  const tipo=getTipo();

  const prestamo=Math.max(0,price-down);
  const cuota=calcular(prestamo,rate,years);
  const n=years*12;
  const totalPagado=cuota*n;
  const interesesTot=totalPagado-prestamo;

  document.getElementById('res-prestamo').textContent='€'+fmt(prestamo);
  document.getElementById('res-plazo').textContent=years+' años';
  document.getElementById('res-provincia').textContent=province+(tipo==='fixed'?' (Fijo)':' (Variable)');
  document.getElementById('res-cuota').textContent='€'+fmt(cuota);

  document.getElementById('kpi-cuota').textContent='€'+fmt(cuota);
  document.getElementById('kpi-intereses').textContent='€'+fmt(interesesTot);
  document.getElementById('kpi-capital').textContent='€'+fmt(prestamo);

  const g = calcularGastosYImpuestos(price,prestamo);
  document.getElementById('res-impuestos').textContent='€'+fmt(g.impuesto);
  document.getElementById('res-notaria').textContent='€'+fmt(g.notaria);
  document.getElementById('res-tasacion').textContent='€'+fmt(g.tasacion);
  document.getElementById('res-total-gastos').textContent='€'+fmt(g.totalGastos);
  document.getElementById('res-total').textContent='€'+fmt(g.total);

  // Tabla de amortización (primeros 12 meses)
  const tableContainer = document.getElementById('amort-table');
  tableContainer.innerHTML = `
    <table class="amort-table">
      <thead>
        <tr>
          <th>Mes</th>
          <th>Cuota</th>
          <th>Interés</th>
          <th>Capital</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  const tbody = tableContainer.querySelector('tbody');
  let saldo = prestamo;

  for (let m = 1; m <= Math.min(12, n); m++) {
    const interesMes = saldo * (rate / 100 / 12);
    const abono = cuota - interesMes;
    saldo = Math.max(0, saldo - abono);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${m}</td>
      <td>€${fmt(cuota)}</td>
      <td>€${fmt(interesMes)}</td>
      <td>€${fmt(abono)}</td>
      <td>€${fmt(saldo)}</td>
    `;
    tbody.appendChild(row);
  }
  document.getElementById("amort-table-print").innerHTML =
  document.getElementById("amort-table").innerHTML;
}

document.getElementById('print').addEventListener('click', () => {
  window.print();
});
document.getElementById('calc').addEventListener('click',update);
document.getElementById('reset').addEventListener('click',()=>{
  document.getElementById('priceProperty').value=250000;
  document.getElementById('entrance').value=50000;
  document.getElementById('years').value=30;
  document.getElementById('rate').value=2.50;
  document.getElementById('province').value="Barcelona";
  gastosPersonalizados.impuestos= 0;
  gastosPersonalizados.notaria= 0;
  gastosPersonalizados.tasacion= 0;
  update();
});

update();

// === MODAL para editar gastos/impuestos ===

// Estado en memoria (persistente con localStorage)
const gastosPersonalizados = { impuestos: null, notaria: null, tasacion: null };


// Referencias al modal y botones
const modal = document.getElementById('inputModal');
const modalTitle = document.getElementById('modal-title');
const modalInput = document.getElementById('modal-input');
const btnSave = document.getElementById('modal-save');
const btnCancel = document.getElementById('modal-cancel');
let currentField = null;

// Mostrar modal
document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentField = btn.dataset.field;
    modalTitle.textContent = `Editar ${currentField}`;
    const valTexto = document.getElementById(`res-${currentField}`).textContent.replace(/[€\s]/g,'');
    modalInput.value = parseFloat(valTexto) || 0;
    modal.classList.remove('hidden');
    modalInput.focus();
  });
});

// Guardar valor y actualizar pantalla
btnSave.addEventListener('click', () => {
  const val = parseFloat(modalInput.value) || 0;
  gastosPersonalizados[currentField] = val;
  modal.classList.add('hidden');
  update(); // recalcula todo con nuevos valores
});

// Cancelar
btnCancel.addEventListener('click', () => modal.classList.add('hidden'));

// Modificamos calcularGastosYImpuestos para usar los valores personalizados
const _originalCalc = calcularGastosYImpuestos;
calcularGastosYImpuestos = function(precio, prestamo) {
  const base = _originalCalc(precio, prestamo);
  // Sobrescribir valores si el usuario los personalizó
  if (gastosPersonalizados.impuestos !== null) base.impuesto = gastosPersonalizados.impuestos;
  if (gastosPersonalizados.notaria !== null) base.notaria = gastosPersonalizados.notaria;
  if (gastosPersonalizados.tasacion !== null) base.tasacion = gastosPersonalizados.tasacion;
  base.totalGastos = base.impuesto + base.notaria + base.tasacion;
  base.total = precio + base.totalGastos;
  return base;
};


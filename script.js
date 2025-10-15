const PROVINCIAS = ["Álava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz","Barcelona","Burgos","Cáceres","Cádiz","Cantabria","Castellón","Ciudad Real","Córdoba","Cuenca","Girona","Granada","Guadalajara","Guipúzcoa","Huelva","Huesca","Islas Baleares","Jaén","La Coruña","La Rioja","Las Palmas","León","Lérida","Lugo","Madrid","Málaga","Murcia","Navarra","Orense","Palencia","Pontevedra","Salamanca","Santa Cruz de Tenerife","Segovia","Sevilla","Soria","Tarragona","Teruel","Toledo","Valencia","Valladolid","Vizcaya","Zamora","Zaragoza","Ceuta","Melilla"];
const BANCOS = ['Banco Santander','BBVA','CaixaBank','Banco Sabadell','Bankinter','ING España','Abanca','Kutxabank','Unicaja Banco','Caixa Popular','Ibercaja','Cajamar'];

const fmt = n => n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2});

// llenar selects
const selProv = document.getElementById('province');
PROVINCIAS.forEach(p => {
  const o = document.createElement('option');
  o.textContent = p;
  selProv.appendChild(o);
});
const selBank = document.getElementById('bank');
BANCOS.forEach(b => {
  const o = document.createElement('option');
  o.textContent = b;
  selBank.appendChild(o);
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
  const randomPorcentaje=(min,max)=>Math.random()*(max-min)+min;
  const ajd = prestamo * (randomPorcentaje(0.5,1.5)/100);
  const impuesto = precio * (randomPorcentaje(5,10)/100);
  const notaria = precio * 0.003;
  const registro = precio * 0.001;
  const gestoria = 400;
  const tasacion = 300;
  const totalGastos = ajd + impuesto + notaria + registro + gestoria + tasacion;
  const total = precio + totalGastos;
  return {ajd,impuesto,notaria,registro,gestoria,tasacion,totalGastos,total};
}

function update(){
  const price=parseFloat(document.getElementById('priceProperty').value)||0;
  const down=parseFloat(document.getElementById('entrance').value)||0;
  const years=parseInt(document.getElementById('years').value)||1;
  const rate=parseFloat(document.getElementById('rate').value)||0;
  const bank=document.getElementById('bank').value;
  const province=document.getElementById('province').value;
  const tipo=getTipo();

  const prestamo=Math.max(0,price-down);
  const cuota=calcular(prestamo,rate,years);
  const n=years*12;
  const totalPagado=cuota*n;
  const interesesTot=totalPagado-prestamo;

  document.getElementById('res-prestamo').textContent='€'+fmt(prestamo);
  document.getElementById('res-plazo').textContent=years+' años';
  document.getElementById('res-banco').textContent=bank;
  document.getElementById('res-provincia').textContent=province+(tipo==='fixed'?' (Fijo)':' (Variable)');
  document.getElementById('res-cuota').textContent='€'+fmt(cuota);

  document.getElementById('kpi-cuota').textContent='€'+fmt(cuota);
  document.getElementById('kpi-intereses').textContent='€'+fmt(interesesTot);
  document.getElementById('kpi-capital').textContent='€'+fmt(prestamo);

  const g = calcularGastosYImpuestos(price,prestamo);
  document.getElementById('res-ajd').textContent='€'+fmt(g.ajd);
  document.getElementById('res-impuestos').textContent='€'+fmt(g.impuesto);
  document.getElementById('res-notaria').textContent='€'+fmt(g.notaria);
  document.getElementById('res-registro').textContent='€'+fmt(g.registro);
  document.getElementById('res-gestoria').textContent='€'+fmt(g.gestoria);
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

}

document.getElementById('calc').addEventListener('click',update);
document.getElementById('reset').addEventListener('click',()=>{
  document.getElementById('priceProperty').value=250000;
  document.getElementById('entrance').value=50000;
  document.getElementById('years').value=25;
  document.getElementById('rate').value=3.25;
  update();
});

update();

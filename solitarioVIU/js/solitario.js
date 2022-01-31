/***** INICIO DECLARACIÓN DE VARIABLES GLOBALES *****/

// Array de figuras
let figuras = [
	{ figura: "viu", color: "naranja" },
	{ figura: "cua", color: "naranja" },
	{ figura: "hex", color: "gris" },
	{ figura: "cir", color: "gris" }
];
// Array de número de cartas
//let numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// En las pruebas iniciales solo se trabajará con cuatro cartas por figura:
let numeros = [9, 10, 11, 12];

// paso (top y left) en pixeles de una carta a la siguiente en un mazo
let paso = 5;

// Tapetes				
let tapete_inicial;
let tapete_sobrantes;
let tapete_receptor1;
let tapete_receptor2;
let tapete_receptor3;
let tapete_receptor4;

// Mazos
let mazo_inicial = [];
let mazo_sobrantes = [];
let mazo_receptor1 = [];
let mazo_receptor2 = [];
let mazo_receptor3 = [];
let mazo_receptor4 = [];

// Contadores de cartas
let cont_inicial;
let cont_sobrantes;
let cont_receptor1;
let cont_receptor2;
let cont_receptor3;
let cont_receptor4;
let cont_movimientos;

// Tiempo
let cont_tiempo; // span cuenta tiempo
let segundos = 0;    // cuenta de segundos
let temporizador = null; // manejador del temporizador

/***** FIN DECLARACIÓN DE VARIABLES GLOBALES *****/


// Rutina asociada a boton reset: comenzar_juego
window.onload = init
function init() {
	cargarEtiquetasHtml();
	comenzar_juego();
}

function cargarEtiquetasHtml() {

	document.getElementById("reset").onclick = reiniciar;


	//Tapetes
	tapete_inicial = document.getElementById("inicial");
	tapete_sobrantes = document.getElementById("sobrantes");
	tapete_receptor1 = document.getElementById("receptor1");
	tapete_receptor2 = document.getElementById("receptor2");
	tapete_receptor3 = document.getElementById("receptor3");
	tapete_receptor4 = document.getElementById("receptor4");

	//Contadores
	cont_inicial = document.getElementById("contador_inicial");
	cont_sobrantes = document.getElementById("contador_sobrantes");
	cont_receptor1 = document.getElementById("contador_receptor1");
	cont_receptor2 = document.getElementById("contador_receptor2");
	cont_receptor3 = document.getElementById("contador_receptor3");
	cont_receptor4 = document.getElementById("contador_receptor4");
	cont_movimientos = document.getElementById("contador_movimientos");

	//Tiempo
	cont_tiempo = document.getElementById("contador_tiempo")

}

function reiniciar() {
	location.reload();
}

function cargarMazoInicial(mazo) {
	mazo.length = 0;
	figuras.forEach(figura => {
		numeros.forEach(numero => {
			let baraja = { numero: numero, ...figura }
			mazo.push(baraja);
		});
	});
}



function comenzar_juego() {

	cargarMazoInicial(mazo_inicial);

	// Barajar
	barajar(mazo_inicial);

	// Dejar mazo_inicial en tapete inicial
	cargar_tapete_inicial(mazo_inicial);

	// Puesta a cero de contadores de mazos
	set_contador(cont_inicial, mazo_inicial.length);
	set_contador(cont_sobrantes, 0);
	set_contador(cont_receptor1, 0);
	set_contador(cont_receptor2, 0);
	set_contador(cont_receptor3, 0);
	set_contador(cont_receptor4, 0);
	set_contador(cont_movimientos, 0);

	// Arrancar el conteo de tiempo
	arrancar_tiempo();

} 

tiempo="";

function arrancar_tiempo() {
	if (temporizador) clearInterval(temporizador);
	let hms = function () {
		let seg = Math.trunc(segundos % 60);
		let min = Math.trunc((segundos % 3600) / 60);
		let hor = Math.trunc((segundos % 86400) / 3600);
		tiempo = ((hor < 10) ? "0" + hor : "" + hor)
			+ ":" + ((min < 10) ? "0" + min : "" + min)
			+ ":" + ((seg < 10) ? "0" + seg : "" + seg);
		set_contador(cont_tiempo, tiempo);
		segundos++;
	}
	segundos = 0;
	hms();
	temporizador = setInterval(hms, 1000);

}

function barajar(mazo) {
	mazo.forEach((baraja, i) => {
		let j = Math.floor(Math.random() * mazo.length);
		mazo[i] = mazo[j];
		mazo[j] = baraja;
	});
}

function cargar_tapete_inicial(mazo) {
	let gap = 4;
	let altoContenedorInicial = window.getComputedStyle(tapete_inicial).height.replace(/\D/g, "");;
	let altoBaraja = `${altoContenedorInicial - (mazo.length * gap)}px`;

	mazo.forEach((baraja, index) => {
		let nombre_baraja = `${baraja.numero}-${baraja.figura}`;
		let img = document.createElement("img");
		img.classList.add("baraja");
		img.classList.add("inicial");
		img.classList.add("draggable");
		img.id = nombre_baraja;
		img.setAttribute("src", `./imagenes/baraja/${baraja.numero}-${baraja.figura}.png`);
		img.setAttribute("data-figura", baraja.figura);
		img.setAttribute("data-numero", baraja.numero);
		img.setAttribute("data-color", baraja.color);
		img.setAttribute("alt", nombre_baraja);
		img.style.left = `${index * gap}px`;
		img.style.top = `${index * gap}px`;
		img.style.height = altoBaraja;
		img.draggable = true;
		img.addEventListener('dragstart', handleDragStart);
		img.addEventListener('dragend', handleDragEnd);
		img.addEventListener('ondrop', onDropBaraja);
		img.addEventListener('ondragover', dragOverBaraja);
		tapete_inicial.appendChild(img);
	});

}

function dragOverBaraja(ev) {
	ev.preventDefault();
}

function onDropBaraja(ev) {
	ev.preventDefault();
}



function dragOverSobrantes(ev) {
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
}

function onDropSobrantes(ev, contador) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var img = document.getElementById(data);
	if (img.getAttribute("data-numero") != 12) {
		moverASobrantes(img, contador);
	}
}

function moverASobrantes(img, contador){
	img.classList.add("colocada");
	img.classList.remove("inicial")
	tapete_sobrantes.appendChild(img);
	inc_contador(contador);
	dec_contador(cont_inicial);
	comprobarRebarajeoDeSobrantes();
}


function dragOverReceptor(ev) {
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
}

function onDropReceptor(ev, receptor, contador) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	var img = document.getElementById(data);
	var target = ev.target;
	if (img.getAttribute("data-numero") == 12) {
		moverAReceptor(img, receptor, contador);
	} else if ((img.getAttribute("data-numero") == target.getAttribute("data-numero")-1) && img.getAttribute("data-color") != target.getAttribute("data-color")) {
		moverAReceptor(img, receptor, contador);
	}
}

function moverAReceptor(img, receptor, contador){
	img.classList.add("colocada");
	img.classList.remove("inicial");
	receptor.appendChild(img);
	inc_contador(contador);
	set_contador(cont_inicial,tapete_inicial.childElementCount-1);
	set_contador(cont_sobrantes,tapete_sobrantes.childElementCount-1);
	comprobarRebarajeoDeSobrantes();
	comprobarFinDelJuego();
	img.removeEventListener('dragstart', handleDragStart);
	img.removeEventListener('ondrop', onDropBaraja);
	img.removeEventListener('ondragover', dragOverBaraja);
}

function handleDragStart(ev) {
	this.style.opacity = '0';
	ev.dataTransfer.setData("text", ev.target.id);
	ev.dataTransfer.dropEffect = "move";
}


function handleDragEnd() {
	this.style.opacity = '1';
}


function inc_contador(contador=null) {
	cont_movimientos.innerHTML = +cont_movimientos.innerHTML + 1;
	if(contador){
		contador.innerHTML = +contador.innerHTML + 1;
	}
} 

function dec_contador(contador) {
	contador.innerHTML = contador.innerHTML - 1;
} 

function set_contador(contador, valor) {
	contador.textContent = valor;
} 

function comprobarRebarajeoDeSobrantes(){
	if(cont_inicial.innerHTML==0 && cont_sobrantes.innerHTML!=0){
		let children = tapete_sobrantes.querySelectorAll(".baraja");
		console.log(children)
		children.forEach(child => {
			moverAInicial(child);
		});
	}
}

function moverAInicial(img){
	img.classList.remove("colocada");
	img.classList.add("inicial");
	img.classList.add("draggable");
	tapete_inicial.appendChild(img);
	set_contador(cont_inicial,tapete_inicial.childElementCount-1);
	set_contador(cont_sobrantes,tapete_sobrantes.childElementCount-1);

}

function comprobarFinDelJuego(){
	if(cont_inicial.innerHTML==0 && cont_sobrantes.innerHTML==0){
		let alerta = document.getElementById("alerta");
		let mensaje = document.getElementById("mensaje-final");
		mensaje.innerText = `Felicitaciones, ha terminado el juego en ${tiempo} con ${cont_movimientos.innerHTML} movimientos`;
		alerta.classList.remove("alerta-final");
		clearInterval(temporizador);
		
	}

}
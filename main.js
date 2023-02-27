document.addEventListener("DOMContentLoaded", () => {

    /*VARIABLES*/
    const btnVerificar = document.querySelector("#verificar");
    const btnVaciarLogs = document.querySelector("#vaciar");
    const tblListado = document.querySelector('tbody');
    const body = document.querySelector('body');
    const divDatosCompletos = document.querySelector('#datosCompletos');
    const spnErrMatr = document.querySelector('#errorMatricula');
    const pMensaje = document.querySelector('#mensaje');
    const divMensaje = document.querySelector('#divMensaje');
    const txtMatricula = document.querySelector('#matricula');
    const spnUltimaBusqueda = document.querySelector('#ultimaBusqueda');

    const arrayPropietarios = [
        { id: 'p1', dni: "13524657F", nombre: "Lucas", direccion: 'Av. Madrid Nº 15 - 3º C', telefono: '698172165' },
        { id: 'p2', dni: "54916785H", nombre: "Juan", direccion: 'Calle Tolosa Nº 53, PB', telefono: '615328475' },
        { id: 'p3', dni: "56456434A", nombre: "Pedro", direccion: 'Calle Paseos Nº 523, 6ª Der', telefono: '632898732' },
        { id: 'p4', dni: "12345461T", nombre: "Marcos", direccion: 'Av. Libertad Nº 120, Bajo', telefono: '679165893' },
        { id: 'p5', dni: "56489444Q", nombre: "Pablo", direccion: 'Calle Zarategi Nº 89, 3º A', telefono: '632198746' },
        { id: 'p6', dni: "32897546D", nombre: "Manuel", direccion: 'Paseo del Norte Nº 4', telefono: '636189765' },
        { id: 'p7', dni: "54894849T", nombre: "José", direccion: 'Calle Museos Nº 153, 8º F', telefono: '691189465' }
    ];
    const arrayCoches = [
        { id: 'p1', matricula: '1354JFS', modelo: 'Seat Ibiza', anio: 2020 },
        { id: 'p2', matricula: '9814SDG', modelo: 'Ford Focus', anio: 2001 },
        { id: 'p3', matricula: '8977FEE', modelo: 'Renault Clio', anio: 2016 },
        { id: 'p4', matricula: '1327EQV', modelo: 'Citroen C4', anio: 2013 },
        { id: 'p5', matricula: '8965NRT', modelo: 'Mercedes Benz Clase A', anio: 2018 }
    ];
    const arrayMultas = [
        { id: 'p1', multas: 2, estado: 'Alta' },
        { id: 'p3', multas: 4, estado: 'Baja' },
        { id: 'p4', multas: 1, estado: 'Alta' },
        { id: 'p5', multas: 19, estado: 'Búsqueda y Captura' },
    ];
    const arrayReportes = JSON.parse(localStorage.getItem('arrayReportes')) || [];

    /*EVENTOS*/
    body.addEventListener('click', ev => {
        ev.preventDefault();

        if (ev.target.id == 'verificar') init();
        if (ev.target.id == 'vaciar') vaciarLogs();
        if (ev.target.matches('TD')) pintarInfoExtra(null, ev.target);
    })

    /*FUNCIONES*/

    //Pinta la fecha y hora de la última búsqueda    
    const pintarUltimaBusqueda = (matricula) => {
        const ahora = new Date();
        spnUltimaBusqueda.textContent = `${ahora.toLocaleDateString()} ${ahora.toLocaleTimeString()} - 
            Matrícula: '${matricula}'.`;
    }


    //Verifica que la matrícula sea válida
    const comprobarMatricula = async () => {
        const verMat = /^[\d]{4}\s*[a-z]{3}$/i;

        if (verMat.test(txtMatricula.value)) {
            spnErrMatr.textContent = '';
            return txtMatricula.value;
        } else {
            const error = new Error(`El formato de la matrícula es incorrecto.\nPor favor, verifícalo.`);
            error.name = 'matricula';
            throw error;
        }
    }


    //Comprueba si la matrícula esta asociada a algún coche
    const cocheExist = async (matricula) => {
        const newMat = matricula.toUpperCase().replace(' ', '');
        const coche = arrayCoches.find(coche => coche.matricula == newMat);
        txtMatricula.value = '';

        if (coche) {
            return coche;
        } else {
            const error = new Error(`No hay ningún coche registrado con la matrícula: ${newMat}`);
            error.name = 'custom';
            throw error;
        }
    }


    //Recupera al propietario del coche
    const getPropietario = async (id) => {
        const propietario = arrayPropietarios.find(sujeto => sujeto.id == id);
        if (propietario) {
            return propietario;
        } else {
            throw 'El ID del propietario no existe.';
        }
    }


    //Recupera el reporte del estado del coche
    const getEstado = async (coche) => {
        const estado = arrayMultas.find(reporte => reporte.id == coche.id);
        if (estado) {
            return estado;
        } else {
            const error = new Error(`El ${coche.modelo}, matrícula: ${coche.matricula} NO tiene ninguna multa.`);
            error.name = 'custom';
            throw error;
        }
    }


    //Pinta la tabla con los informes guardados en el Local Storage
    const pintarInforme = () => {
        const fragment = document.createDocumentFragment();
        const arrayTemp = getLocal();
        let cont = 0;

        tblListado.innerHTML = '';
        arrayTemp.forEach(reporte => {
            cont++;
            const trLista = document.createElement("TR");
            trLista.classList.add(reporte.id);

            const txtNro = document.createElement("TD");
            txtNro.textContent = `#${cont}`;

            const tdMatricula = document.createElement("TD");
            tdMatricula.textContent = reporte.matricula;

            const tdModelo = document.createElement("TD");
            tdModelo.textContent = reporte.modelo;

            const tdPropietario = document.createElement("TD");
            tdPropietario.textContent = reporte.propietario;

            const tdMultas = document.createElement("TD");
            tdMultas.textContent = reporte.multas;

            trLista.append(txtNro, tdMatricula, tdModelo, tdPropietario, tdMultas);
            fragment.append(trLista);
        })
        if (arrayTemp.length == 0) {
            const trSinBusquedas = document.createElement("TR");
            const tdSinBusquedas = document.createElement("TD");
            tdSinBusquedas.textContent = 'No hay búsquedas almacenadas para mostrar.';
            tdSinBusquedas.setAttribute("colspan", "5");

            trSinBusquedas.append(tdSinBusquedas);
            fragment.append(trSinBusquedas);

            btnVaciarLogs.disabled = true;
            divDatosCompletos.innerHTML = '';
            pintarBarraMensajes(false);
        }
        tblListado.append(fragment);
    }


    /*Muestra el resto de datos del elemento de la tabla que elija el usuario*/
    const pintarInfoExtra = (id, elemento) => {
        let indice = 4;
        if (id == null) {
            id = elemento.parentElement.className;
            indice = elemento.cellIndex;
        }

        const fragment = document.createDocumentFragment();
        switch (indice) {
            case 1:
            case 2:
                fragment.append(pintarInfoExtraCoche(id));
                break;

            case 3:
                fragment.append(pintarInfoExtraPropietario(id));
                break;

            case 4:
                fragment.append(pintarInfoExtraEstado(id));
                break;
        }
        divDatosCompletos.innerHTML = '';
        divDatosCompletos.append(fragment);
    }


    /*Muesta la información completa del coche*/
    const pintarInfoExtraCoche = id => {
        pintarBarraMensajes(false);
        const ulCoche = document.createElement("UL");
        const coche = arrayCoches.find(coche => coche.id == id);

        const liCocheMod = document.createElement("LI");
        liCocheMod.textContent = `Modelo: ${coche.modelo}`;

        const liAnio = document.createElement("LI");
        liAnio.textContent = `Año: ${coche.anio}`;

        const liMatricula = document.createElement("LI");
        liMatricula.textContent = `Matrícula: ${coche.matricula}`;

        ulCoche.append(liCocheMod, liAnio, liMatricula);
        return ulCoche;
    }


    /*Muesta la información completa del propietario*/
    const pintarInfoExtraPropietario = id => {
        pintarBarraMensajes(false);
        const ulPropietario = document.createElement("UL");
        const propietario = arrayPropietarios.find(sujeto => sujeto.id == id);

        const liPropietarioNom = document.createElement("LI");
        liPropietarioNom.textContent = `Nombre: ${propietario.nombre}`;

        const liPropietarioDNI = document.createElement("LI");
        liPropietarioDNI.textContent = `DNI: ${propietario.dni}`;

        const liPropietarioTel = document.createElement("LI");
        liPropietarioTel.textContent = `Teléfono: ${propietario.telefono}`;

        const liPropietarioDir = document.createElement("LI");
        liPropietarioDir.textContent = `Dirección: ${propietario.direccion}`;

        ulPropietario.append(liPropietarioNom, liPropietarioDNI, liPropietarioTel, liPropietarioDir);
        return ulPropietario;
    }

    /*Muesta la información completa del estado del coche*/
    const pintarInfoExtraEstado = id => {
        const ulEstado = document.createElement("UL");
        const reporte = arrayMultas.find(reporte => reporte.id == id);

        const liEstadoMul = document.createElement("LI");
        liEstadoMul.textContent = `Multas: ${reporte.multas}`;

        const liEstadoEst = document.createElement("LI");
        liEstadoEst.textContent = `Estado: ${reporte.estado}`;

        ulEstado.append(liEstadoMul, liEstadoEst);

        if (reporte.estado.includes('Captura')) {
            pintarBarraMensajes(true);
            pMensaje.textContent = 'Atención: este coche esta en ' + reporte.estado;
        } else {
            pintarBarraMensajes(false);
        }
        return ulEstado;
    }


    //Recupera del Local Storage
    const getLocal = () => {
        return JSON.parse(localStorage.getItem('arrayReportes')) || [];
    }


    // Guarda en el Local Storage
    const setLocal = (id, matricula, modelo, propietario, multas) => {
        arrayReportes.push({ id, matricula, modelo, propietario, multas });
        localStorage.setItem("arrayReportes", JSON.stringify(arrayReportes));
    }


    //Vacia el Local Storage.
    const vaciarLogs = () => {
        localStorage.removeItem('arrayReportes');
        arrayReportes.splice(0);
        pintarInforme();
    }


    //Muestra u oculta la barra de mensajes P
    const pintarBarraMensajes = (estado) => {
        if (estado) {
            divMensaje.style = 'display: initial';
        } else {
            divMensaje.style = 'display: none';
        }
    }

    //Analiza la matrícula ingresada
    const obtenerMatricula = async () => {
        try {
            pintarUltimaBusqueda(txtMatricula.value);

            const matricula = await comprobarMatricula();
            const objCoche = await cocheExist(matricula);
            const objPropietario = await getPropietario(objCoche.id);
            const objEstado = await getEstado(objCoche);

            pMensaje.textContent = `Matrícula: ${matricula.toUpperCase()}`;

            setLocal(objPropietario.id, objCoche.matricula, objCoche.modelo, objPropietario.nombre, objEstado.multas);
            pintarInforme();
            pintarInfoExtra(objCoche.id);

            btnVaciarLogs.disabled = false;

        } catch (error) {
            if (error.name == 'matricula') {
                pintarBarraMensajes(false);
                spnErrMatr.textContent = error.message;
            } else if (error.name == 'custom') {
                pintarBarraMensajes(true);
                pMensaje.textContent = error.message;
            } else {
                pintarBarraMensajes(true);
                pMensaje.innerHTML = error;
            }
        }
    }

    const init = () => {
        obtenerMatricula();
    }

    pintarInforme();

}) //Load
document.addEventListener("DOMContentLoaded", () => {

    /*VARIABLES*/
    const btnVerificar = document.querySelector("#verificar");
    const tblListado = document.querySelector('tbody');
    const pMensaje = document.querySelector('#mensaje');

    const arrayPropietarios = [
        { id: 'p1', dni: "13524657F", nombre: "Lucas", direccion: '', telefono: '' },
        { id: 'p2', dni: "54916785H", nombre: "Juan", direccion: '', telefono: '' },
        { id: 'p3', dni: "56456434A", nombre: "Pedro", direccion: '', telefono: '' },
        { id: 'p4', dni: "12345461T", nombre: "Marcos", direccion: '', telefono: '' },
        { id: 'p5', dni: "56489444Q", nombre: "Pablo", direccion: '', telefono: '' },
        { id: 'p6', dni: "32897546D", nombre: "Manuel", direccion: '', telefono: '' },
        { id: 'p7', dni: "54894849T", nombre: "José", direccion: '', telefono: '' }
    ];
    const arrayCoches = [
        { id: 'p1', matricula: '1354JFS', modelo: 'Seat Ibiza', anio: 2020 },
        { id: 'p2', matricula: '9814SDG', modelo: 'Ford Focus', anio: 2001 },
        { id: 'p3', matricula: '8977FEE', modelo: 'Renault Clio', anio: 2016 },
        { id: 'p4', matricula: '1327EQV', modelo: 'Citroen C4', anio: 2013 },
        { id: 'p5', matricula: '8965NRT', modelo: 'Mercedes Clase A', anio: 2018 }
    ];
    const arrayMultas = [
        { id: 'p1', multas: 2, estado: 'alta' },
        { id: 'p3', multas: 4, estado: 'baja' },
        { id: 'p4', multas: 1, estado: 'alta' },
        { id: 'p5', multas: 19, estado: 'busqueda y captura' },
    ];
    const arrayReportes = JSON.parse(localStorage.getItem('arrayReportes')) || [];

    /*EVENTOS*/
    btnVerificar.addEventListener('click', (ev) => {
        ev.preventDefault();
        init();
    })


    /*FUNCIONES*/

    //Verifica que la matrícula sea válida
    const checkMatricula = async () => {
        const txtMatricula = document.querySelector('#matricula');
        const spnErrMatr = document.querySelector('#errorMatricula');
        const ulPropietario = document.querySelector("#propietario")
        const ulCoche = document.querySelector("#coche")
        const ulEstado = document.querySelector("#estado")
        const verMat = /^[\d]{4}\s*[a-z]{3}$/i;

        if (verMat.test(txtMatricula.value)) {
            spnErrMatr.textContent = '';
            return txtMatricula.value;
        } else {
            spnErrMatr.textContent = `El formato de la matrícula es incorrecto.\nPor favor, verifícalo.`;
            throw '';
        }
    }


    //Comprueba si la matrícula esta asociada a algún coche
    const cocheExist = async (matricula) => {
        const newMat = matricula.toUpperCase().replace(' ', '');
        const coche = arrayCoches.find(coche => coche.matricula == newMat);

        if (coche) {
            return coche;
        } else {
            throw "No existe ningún coche con esa matrícula.";
        }
    }


    //Recupera al propietario del coche
    const getPropietario = async (id) => {
        const propietario = arrayPropietarios.find(sujeto => sujeto.id == id);
        if (propietario) {
            return propietario;
        }
    }


    //Recupera el estado del coche
    const getEstado = async (coche) => {
        const estado = arrayMultas.find(reporte => reporte.id == coche.id);
        if (estado) {
            return estado;
        } else {
            throw `El ${coche.modelo}, matrícula: ${coche.matricula} no tiene ninguna multa.`;
        }
    }


    //Pinta la tabla con los informes
    const mostrarInforme = () => {
        const fragment = document.createDocumentFragment();
        const arrayTemp = getLocal();
        tblListado.innerHTML = '';

        arrayTemp.forEach(reporte => {
            const trLista = document.createElement("TR");
            const tdMatricula = document.createElement("TD");
            tdMatricula.textContent = reporte.matricula;

            const tdModelo = document.createElement("TD");
            tdModelo.textContent = reporte.modelo;

            const tdPropietario = document.createElement("TD");
            tdPropietario.textContent = reporte.propietario;

            const tdMultas = document.createElement("TD");
            tdMultas.textContent = reporte.multas;

            trLista.append(tdModelo, tdMatricula, tdPropietario, tdMultas);
            fragment.append(trLista);
        })
        tblListado.append(fragment);
    }
   


    //Recupera del Local Storage
    const getLocal = () => {
        return JSON.parse(localStorage.getItem('arrayReportes')) || [];
    }


    // Guarda en el Local Storage
    const setLocal = (id, matricula, modelo, propietario, multas) => {
        arrayReportes.push(
            { id: id, matricula: matricula, modelo: modelo, propietario: propietario, multas: multas }
        );
        localStorage.setItem("arrayReportes", JSON.stringify(arrayReportes));
    }

    //Analiza la matrícula ingresada
    const obtenerMatricula = async () => {
        try {

            const matricula = await checkMatricula();
            const objCoche = await cocheExist(matricula);
            const objPropietario = await getPropietario(objCoche.id);
            const objEstado = await getEstado(objCoche);

            setLocal(objPropietario.id, objCoche.matricula, objCoche.modelo, objPropietario.nombre, objEstado.multas);
            mostrarInforme();
            // mostrarDatosCompletos(objCoche, objPropietario, objEstado);

        } catch (error) {
            pMensaje.textContent = error;
        }
    }

    const init = () => {
        pMensaje.textContent = '';
        obtenerMatricula();
    }

    mostrarInforme();

}) //Load
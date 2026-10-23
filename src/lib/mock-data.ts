// Mock data extracted from the provided XLSX (Usuarios & Destinos sheets)
// Used for the simulated Davivienda enterprise portal under test by APTP.

export type MockUser = {
  cliente: string;
  tipoId: string;
  numDocumento: string;
  clave: string;
  token?: string;
  celular?: string;
  nombre: string;
  empresa: string;
};

export type MockDestino = {
  id: string;
  tipoId: string;
  numIdentificacion: string;
  tipoCuenta: string;
  numCuenta: string;
  banco: string;
  titular: string;
};

export const MOCK_USERS: MockUser[] = [
  { cliente: "312", tipoId: "Cédula de Ciudadanía", numDocumento: "20242587", clave: "123456", token: "63866019", nombre: "María González", empresa: "FRONTIERLINER" },
  { cliente: "312", tipoId: "Cédula de Ciudadanía", numDocumento: "11223301", clave: "123456", token: "59611776", nombre: "Carlos Ramírez", empresa: "FRONTIERLINER" },
  { cliente: "110", tipoId: "Cédula de Extranjería", numDocumento: "113730", clave: "12345678", token: "64272140", nombre: "Andrés Pérez", empresa: "COMPANITA" },
  { cliente: "312", tipoId: "Cédula de Ciudadanía", numDocumento: "56417859", clave: "123456", token: "49902922", nombre: "Lucía Torres", empresa: "FRONTIERLINER" },
  { cliente: "201319", tipoId: "Cédula de Ciudadanía", numDocumento: "1233896904", clave: "2023", celular: "3213039000", nombre: "Juan Donguett", empresa: "RESTAURANTE CARNE Y" },
  { cliente: "201971", tipoId: "Cédula de Ciudadanía", numDocumento: "1010226674", clave: "2023", celular: "3208191000", nombre: "Sofía Beltrán", empresa: "COMPANITA" },
  { cliente: "202518", tipoId: "Cédula de Extranjería", numDocumento: "113439", clave: "123456", token: "66347217", nombre: "Roberto Suárez", empresa: "COMPANITA" },
  { cliente: "202518", tipoId: "Tarjeta de Identidad", numDocumento: "1012312345", clave: "123456", token: "30779472", nombre: "Camila Rivera", empresa: "COMPANITA" },
  { cliente: "202485", tipoId: "Pasaporte", numDocumento: "17118906436", clave: "123456", token: "18679587", nombre: "Diego Morales", empresa: "RESTAURANTE CARNE Y" },
  { cliente: "202561", tipoId: "Tarjeta de Identidad", numDocumento: "2012389685", clave: "2020", celular: "3042789000", nombre: "Valentina Castro", empresa: "FRONTIERLINER" },
  { cliente: "202474", tipoId: "Tarjeta de Identidad", numDocumento: "1010030244", clave: "2023", celular: "3042488000", nombre: "Mateo Vargas", empresa: "COMPANITA" },
  { cliente: "202485", tipoId: "NIT Desasociado", numDocumento: "11304789", clave: "123456", token: "80455122", nombre: "Empresa NIT", empresa: "RESTAURANTE CARNE Y" },
  { cliente: "202680", tipoId: "Tarjeta de identidad", numDocumento: "1010235326", clave: "12345678", token: "76533488", nombre: "Isabela Núñez", empresa: "COMPANITA" },
  { cliente: "202673", tipoId: "Tarjeta de identidad", numDocumento: "4345265598", clave: "1483", celular: "3152584000", nombre: "Sebastián López", empresa: "FRONTIERLINER" },
];

export const MOCK_DESTINOS: MockDestino[] = [
  { id: "D01", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "570098370014007", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D02", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "550098100958317", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D03", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA CORRIENTE", numCuenta: "560098369988625", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D04", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "570510670000957", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D05", tipoId: "NIT", numIdentificacion: "8600075382", tipoCuenta: "CUENTA CORRIENTE", numCuenta: "10148229", banco: "DAVIVIENDA", titular: "Comercializadora Norte Ltda." },
  { id: "D06", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA CORRIENTE", numCuenta: "75028704", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D07", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA CORRIENTE", numCuenta: "1082869971", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D08", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "1082869971", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D09", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "75153213", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D10", tipoId: "NIT", numIdentificacion: "8000190511", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "1082869971", banco: "DAVIVIENDA", titular: "Distribuidora Andina S.A." },
  { id: "D11", tipoId: "NIT", numIdentificacion: "8300035425", tipoCuenta: "CUENTA CORRIENTE", numCuenta: "1082869972", banco: "DAVIVIENDA", titular: "Inversiones Pacífico" },
  { id: "D12", tipoId: "NIT", numIdentificacion: "8300035425", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "1082869973", banco: "DAVIVIENDA", titular: "Inversiones Pacífico" },
  { id: "D13", tipoId: "NIT", numIdentificacion: "8006007002", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "1082869974", banco: "DAVIVIENDA", titular: "Servicios Generales SAS" },
  { id: "D14", tipoId: "NIT", numIdentificacion: "8006007002", tipoCuenta: "CUENTAS CORRIENTES OTROS BANCOS", numCuenta: "1082869975", banco: "BBVA", titular: "Servicios Generales SAS" },
  { id: "D15", tipoId: "NIT", numIdentificacion: "8300810941", tipoCuenta: "CUENTA DE AHORRO", numCuenta: "1082869976", banco: "DAVIVIENDA", titular: "Construcciones Caribe" },
  { id: "D16", tipoId: "NIT", numIdentificacion: "8300035425", tipoCuenta: "CUENTA CORRIENTE", numCuenta: "1082869977", banco: "DAVIVIENDA", titular: "Inversiones Pacífico" },
  { id: "D17", tipoId: "Cédula de Ciudadanía", numIdentificacion: "2569173", tipoCuenta: "CUENTAS AHORRO OTROS BANCOS", numCuenta: "3158005001", banco: "NEQUI", titular: "Juan Vargas" },
  { id: "D18", tipoId: "NIT", numIdentificacion: "8300035425", tipoCuenta: "CUENTAS AHORRO OTROS BANCOS", numCuenta: "6841313", banco: "BBVA", titular: "Inversiones Pacífico" },
  { id: "D19", tipoId: "NIT", numIdentificacion: "8300035426", tipoCuenta: "CUENTAS AHORRO OTROS BANCOS", numCuenta: "23211313213", banco: "BBVA", titular: "Logística Andina" },
];

export const SERVICIOS_DESTINO = [
  "Pago a Proveedores",
  "Pago de Servicios",
  "Pago de Nóminas",
  "Pago de Subsidio Familiar",
  "Pago de Subsidio Vivienda",
  "Transferencias, Usos y Avances",
  "Transferencia a Cuenta en Lotes",
  "Pago de Rendimientos",
  "Abonos a Encargos Fiduciarios",
  "Compras por internet - Seguridad social",
];

export const TIPOS_CUENTA = [
  "CUENTA DE AHORRO",
  "CUENTA CORRIENTE",
  "CUENTAS AHORRO OTROS BANCOS",
  "CUENTAS CORRIENTES OTROS BANCOS",
  "DAVIPLATA",
];

export const TIPOS_ID = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Tarjeta de Identidad",
  "Pasaporte",
  "NIT",
  "NIT Desasociado",
  "Fideicomiso",
];

export const BANCOS = ["DAVIVIENDA", "BBVA", "BANCOLOMBIA", "NEQUI", "DAVIPLATA", "BANCAMIA"];

// SACRÉ — ESLint 9 flat config.
// HISTÓRICO: el gate lint quedó roto tras el upgrade a Next 16.3.6 (ORN-200):
// Next 16 removió `next lint` y eslint-config-next@16 pasó a ser flat-only,
// así que el .eslintrc.json legacy dejó de ser cargable (circular structure
// en el loader eslintrc). Este config es el equivalente flat de los extends
// viejos: next/core-web-vitals + next/typescript. Sin dependencias nuevas.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
    {
        ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"],
    },
    ...coreWebVitals,
    ...typescript,
];

export default config;

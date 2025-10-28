import React from 'react';

export const SecurityWarning: React.FC = () => (
    <div className="bg-green-500/10 border-l-4 border-green-500 text-green-300 p-4 rounded-r-lg" role="alert">
        <p className="font-bold">Arhitektura aplikacije</p>
        <p className="text-sm mt-2">
            Ta aplikacija zdaj uporablja varno arhitekturo s strežnikom (backend), ki deluje na platformi Netlify.
        </p>
        <ul className="text-sm mt-2 list-disc list-inside space-y-1">
            <li><strong>Varnost:</strong> Vaši Tuya API ključi (`Access ID` in `Access Secret`) so varno shranjeni kot okoljske spremenljivke na Netlifyju in niso nikoli izpostavljeni v brskalniku.</li>
            <li><strong>Delovanje:</strong> Ta spletna aplikacija (frontend) pošlje podatke o moči naši Netlify funkciji, ki nato varno komunicira s Tuya Cloud API-jem.</li>
        </ul>
        <p className="text-sm mt-2">
            Ta pristop zagotavlja, da vaši občutljivi podatki ostanejo varni.
        </p>
    </div>
);
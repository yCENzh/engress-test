import { DurableObject } from 'cloudflare:workers';

// 改这里测试不同区域: wnam(美西), enam(美东), weur(西欧), eap(东亚) ...
const LOCATION_HINT = 'wnam' as DurableObjectLocationHint;

export class EgressTest extends DurableObject {
    async fetch(request: Request): Promise<Response> {
        const resp = await fetch('https://ipinfo.io/json');
        const info = await resp.json() as any;
        return new Response(JSON.stringify({
            do_location_hint: LOCATION_HINT,
            egress_ip: info.ip,
            city: info.city,
            region: info.region,
            country: info.country,
            org: info.org,
            loc: info.loc,
        }, null, 2), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export default {
    async fetch(request: Request, env: { EGRESS_TEST: DurableObjectNamespace }) {
        const id = env.EGRESS_TEST.idFromName('test');
        const stub = env.EGRESS_TEST.get(id, { locationHint: LOCATION_HINT });
        return stub.fetch(request);
    },
};

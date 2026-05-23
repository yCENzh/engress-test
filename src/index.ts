import { DurableObject } from 'cloudflare:workers';

// 改这里测试不同区域: wnam(美西), enam(美东), weur(西欧), eap(东亚) ...
const LOCATION_HINT = 'apac' as DurableObjectLocationHint;

export class EgressTest extends DurableObject {
    async fetch(request: Request): Promise<Response> {
        let ipInfo: any;
        try {
            const resp = await fetch('http://ip-api.com/json');
            ipInfo = await resp.json();
        } catch (e) {
            ipInfo = { error: String(e) };
        }
        return new Response(JSON.stringify({
            do_location_hint: LOCATION_HINT,
            ...ipInfo,
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

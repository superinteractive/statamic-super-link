const J = Math.min,
    F = Math.max,
    X = Math.round,
    U = Math.floor,
    O = t => ({ x: t, y: t }),
    Tt = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' },
    Ct = { start: 'end', end: 'start' };
function Z(t, e) {
    return typeof t == 'function' ? t(e) : t;
}
function $(t) {
    return t.split('-')[0];
}
function q(t) {
    return t.split('-')[1];
}
function _t(t) {
    return t === 'x' ? 'y' : 'x';
}
function dt(t) {
    return t === 'y' ? 'height' : 'width';
}
function tt(t) {
    return ['top', 'bottom'].includes($(t)) ? 'y' : 'x';
}
function ht(t) {
    return _t(tt(t));
}
function At(t, e, n) {
    n === void 0 && (n = !1);
    const i = q(t),
        o = ht(t),
        l = dt(o);
    let s = o === 'x' ? (i === (n ? 'end' : 'start') ? 'right' : 'left') : i === 'start' ? 'bottom' : 'top';
    return e.reference[l] > e.floating[l] && (s = Y(s)), [s, Y(s)];
}
function Rt(t) {
    const e = Y(t);
    return [Q(t), e, Q(e)];
}
function Q(t) {
    return t.replace(/start|end/g, e => Ct[e]);
}
function Ot(t, e, n) {
    const i = ['left', 'right'],
        o = ['right', 'left'],
        l = ['top', 'bottom'],
        s = ['bottom', 'top'];
    switch (t) {
        case 'top':
        case 'bottom':
            return n ? (e ? o : i) : e ? i : o;
        case 'left':
        case 'right':
            return e ? l : s;
        default:
            return [];
    }
}
function Et(t, e, n, i) {
    const o = q(t);
    let l = Ot($(t), n === 'start', i);
    return o && ((l = l.map(s => s + '-' + o)), e && (l = l.concat(l.map(Q)))), l;
}
function Y(t) {
    return t.replace(/left|right|bottom|top/g, e => Tt[e]);
}
function kt(t) {
    return { top: 0, right: 0, bottom: 0, left: 0, ...t };
}
function Vt(t) {
    return typeof t != 'number' ? kt(t) : { top: t, right: t, bottom: t, left: t };
}
function j(t) {
    return { ...t, top: t.y, left: t.x, right: t.x + t.width, bottom: t.y + t.height };
}
function ct(t, e, n) {
    let { reference: i, floating: o } = t;
    const l = tt(e),
        s = ht(e),
        c = dt(s),
        r = $(e),
        a = l === 'y',
        p = i.x + i.width / 2 - o.width / 2,
        u = i.y + i.height / 2 - o.height / 2,
        d = i[c] / 2 - o[c] / 2;
    let f;
    switch (r) {
        case 'top':
            f = { x: p, y: i.y - o.height };
            break;
        case 'bottom':
            f = { x: p, y: i.y + i.height };
            break;
        case 'right':
            f = { x: i.x + i.width, y: u };
            break;
        case 'left':
            f = { x: i.x - o.width, y: u };
            break;
        default:
            f = { x: i.x, y: i.y };
    }
    switch (q(e)) {
        case 'start':
            f[s] -= d * (n && a ? -1 : 1);
            break;
        case 'end':
            f[s] += d * (n && a ? -1 : 1);
            break;
    }
    return f;
}
const St = async (t, e, n) => {
    const { placement: i = 'bottom', strategy: o = 'absolute', middleware: l = [], platform: s } = n,
        c = l.filter(Boolean),
        r = await (s.isRTL == null ? void 0 : s.isRTL(e));
    let a = await s.getElementRects({ reference: t, floating: e, strategy: o }),
        { x: p, y: u } = ct(a, i, r),
        d = i,
        f = {},
        h = 0;
    for (let g = 0; g < c.length; g++) {
        const { name: y, fn: m } = c[g],
            {
                x,
                y: v,
                data: T,
                reset: w,
            } = await m({
                x: p,
                y: u,
                initialPlacement: i,
                placement: d,
                strategy: o,
                middlewareData: f,
                rects: a,
                platform: s,
                elements: { reference: t, floating: e },
            });
        if (((p = x ?? p), (u = v ?? u), (f = { ...f, [y]: { ...f[y], ...T } }), w && h <= 50)) {
            h++,
                typeof w == 'object' &&
                    (w.placement && (d = w.placement),
                    w.rects && (a = w.rects === !0 ? await s.getElementRects({ reference: t, floating: e, strategy: o }) : w.rects),
                    ({ x: p, y: u } = ct(a, d, r))),
                (g = -1);
            continue;
        }
    }
    return { x: p, y: u, placement: d, strategy: o, middlewareData: f };
};
async function Nt(t, e) {
    var n;
    e === void 0 && (e = {});
    const { x: i, y: o, platform: l, rects: s, elements: c, strategy: r } = t,
        { boundary: a = 'clippingAncestors', rootBoundary: p = 'viewport', elementContext: u = 'floating', altBoundary: d = !1, padding: f = 0 } = Z(e, t),
        h = Vt(f),
        y = c[d ? (u === 'floating' ? 'reference' : 'floating') : u],
        m = j(
            await l.getClippingRect({
                element:
                    (n = await (l.isElement == null ? void 0 : l.isElement(y))) == null || n
                        ? y
                        : y.contextElement || (await (l.getDocumentElement == null ? void 0 : l.getDocumentElement(c.floating))),
                boundary: a,
                rootBoundary: p,
                strategy: r,
            })
        ),
        x = u === 'floating' ? { ...s.floating, x: i, y: o } : s.reference,
        v = await (l.getOffsetParent == null ? void 0 : l.getOffsetParent(c.floating)),
        T = (await (l.isElement == null ? void 0 : l.isElement(v))) ? (await (l.getScale == null ? void 0 : l.getScale(v))) || { x: 1, y: 1 } : { x: 1, y: 1 },
        w = j(
            l.convertOffsetParentRelativeRectToViewportRelativeRect
                ? await l.convertOffsetParentRelativeRectToViewportRelativeRect({ rect: x, offsetParent: v, strategy: r })
                : x
        );
    return {
        top: (m.top - w.top + h.top) / T.y,
        bottom: (w.bottom - m.bottom + h.bottom) / T.y,
        left: (m.left - w.left + h.left) / T.x,
        right: (w.right - m.right + h.right) / T.x,
    };
}
const Lt = function (t) {
    return (
        t === void 0 && (t = {}),
        {
            name: 'flip',
            options: t,
            async fn(e) {
                var n, i;
                const { placement: o, middlewareData: l, rects: s, initialPlacement: c, platform: r, elements: a } = e,
                    {
                        mainAxis: p = !0,
                        crossAxis: u = !0,
                        fallbackPlacements: d,
                        fallbackStrategy: f = 'bestFit',
                        fallbackAxisSideDirection: h = 'none',
                        flipAlignment: g = !0,
                        ...y
                    } = Z(t, e);
                if ((n = l.arrow) != null && n.alignmentOffset) return {};
                const m = $(o),
                    x = $(c) === c,
                    v = await (r.isRTL == null ? void 0 : r.isRTL(a.floating)),
                    T = d || (x || !g ? [Y(c)] : Rt(c));
                !d && h !== 'none' && T.push(...Et(c, g, h, v));
                const w = [c, ...T],
                    k = await Nt(e, y),
                    z = [];
                let P = ((i = l.flip) == null ? void 0 : i.overflows) || [];
                if ((p && z.push(k[m]), u)) {
                    const V = At(o, s, v);
                    z.push(k[V[0]], k[V[1]]);
                }
                if (((P = [...P, { placement: o, overflows: z }]), !z.every(V => V <= 0))) {
                    var ot, st;
                    const V = (((ot = l.flip) == null ? void 0 : ot.index) || 0) + 1,
                        rt = w[V];
                    if (rt) return { data: { index: V, overflows: P }, reset: { placement: rt } };
                    let M = (st = P.filter(N => N.overflows[0] <= 0).sort((N, L) => N.overflows[1] - L.overflows[1])[0]) == null ? void 0 : st.placement;
                    if (!M)
                        switch (f) {
                            case 'bestFit': {
                                var lt;
                                const N =
                                    (lt = P.map(L => [L.placement, L.overflows.filter(B => B > 0).reduce((B, bt) => B + bt, 0)]).sort(
                                        (L, B) => L[1] - B[1]
                                    )[0]) == null
                                        ? void 0
                                        : lt[0];
                                N && (M = N);
                                break;
                            }
                            case 'initialPlacement':
                                M = c;
                                break;
                        }
                    if (o !== M) return { reset: { placement: M } };
                }
                return {};
            },
        }
    );
};
async function Ft(t, e) {
    const { placement: n, platform: i, elements: o } = t,
        l = await (i.isRTL == null ? void 0 : i.isRTL(o.floating)),
        s = $(n),
        c = q(n),
        r = tt(n) === 'y',
        a = ['left', 'top'].includes(s) ? -1 : 1,
        p = l && r ? -1 : 1,
        u = Z(e, t);
    let {
        mainAxis: d,
        crossAxis: f,
        alignmentAxis: h,
    } = typeof u == 'number' ? { mainAxis: u, crossAxis: 0, alignmentAxis: null } : { mainAxis: 0, crossAxis: 0, alignmentAxis: null, ...u };
    return c && typeof h == 'number' && (f = c === 'end' ? h * -1 : h), r ? { x: f * p, y: d * a } : { x: d * a, y: f * p };
}
const Dt = function (t) {
    return (
        t === void 0 && (t = 0),
        {
            name: 'offset',
            options: t,
            async fn(e) {
                var n, i;
                const { x: o, y: l, placement: s, middlewareData: c } = e,
                    r = await Ft(e, t);
                return s === ((n = c.offset) == null ? void 0 : n.placement) && (i = c.arrow) != null && i.alignmentOffset
                    ? {}
                    : { x: o + r.x, y: l + r.y, data: { ...r, placement: s } };
            },
        }
    );
};
function E(t) {
    return pt(t) ? (t.nodeName || '').toLowerCase() : '#document';
}
function b(t) {
    var e;
    return (t == null || (e = t.ownerDocument) == null ? void 0 : e.defaultView) || window;
}
function R(t) {
    var e;
    return (e = (pt(t) ? t.ownerDocument : t.document) || window.document) == null ? void 0 : e.documentElement;
}
function pt(t) {
    return t instanceof Node || t instanceof b(t).Node;
}
function A(t) {
    return t instanceof Element || t instanceof b(t).Element;
}
function _(t) {
    return t instanceof HTMLElement || t instanceof b(t).HTMLElement;
}
function at(t) {
    return typeof ShadowRoot > 'u' ? !1 : t instanceof ShadowRoot || t instanceof b(t).ShadowRoot;
}
function H(t) {
    const { overflow: e, overflowX: n, overflowY: i, display: o } = C(t);
    return /auto|scroll|overlay|hidden|clip/.test(e + i + n) && !['inline', 'contents'].includes(o);
}
function $t(t) {
    return ['table', 'td', 'th'].includes(E(t));
}
function et(t) {
    const e = nt(),
        n = C(t);
    return (
        n.transform !== 'none' ||
        n.perspective !== 'none' ||
        (n.containerType ? n.containerType !== 'normal' : !1) ||
        (!e && (n.backdropFilter ? n.backdropFilter !== 'none' : !1)) ||
        (!e && (n.filter ? n.filter !== 'none' : !1)) ||
        ['transform', 'perspective', 'filter'].some(i => (n.willChange || '').includes(i)) ||
        ['paint', 'layout', 'strict', 'content'].some(i => (n.contain || '').includes(i))
    );
}
function It(t) {
    let e = I(t);
    for (; _(e) && !K(e); ) {
        if (et(e)) return e;
        e = I(e);
    }
    return null;
}
function nt() {
    return typeof CSS > 'u' || !CSS.supports ? !1 : CSS.supports('-webkit-backdrop-filter', 'none');
}
function K(t) {
    return ['html', 'body', '#document'].includes(E(t));
}
function C(t) {
    return b(t).getComputedStyle(t);
}
function G(t) {
    return A(t) ? { scrollLeft: t.scrollLeft, scrollTop: t.scrollTop } : { scrollLeft: t.pageXOffset, scrollTop: t.pageYOffset };
}
function I(t) {
    if (E(t) === 'html') return t;
    const e = t.assignedSlot || t.parentNode || (at(t) && t.host) || R(t);
    return at(e) ? e.host : e;
}
function mt(t) {
    const e = I(t);
    return K(e) ? (t.ownerDocument ? t.ownerDocument.body : t.body) : _(e) && H(e) ? e : mt(e);
}
function W(t, e, n) {
    var i;
    e === void 0 && (e = []), n === void 0 && (n = !0);
    const o = mt(t),
        l = o === ((i = t.ownerDocument) == null ? void 0 : i.body),
        s = b(o);
    return l ? e.concat(s, s.visualViewport || [], H(o) ? o : [], s.frameElement && n ? W(s.frameElement) : []) : e.concat(o, W(o, [], n));
}
function gt(t) {
    const e = C(t);
    let n = parseFloat(e.width) || 0,
        i = parseFloat(e.height) || 0;
    const o = _(t),
        l = o ? t.offsetWidth : n,
        s = o ? t.offsetHeight : i,
        c = X(n) !== l || X(i) !== s;
    return c && ((n = l), (i = s)), { width: n, height: i, $: c };
}
function it(t) {
    return A(t) ? t : t.contextElement;
}
function D(t) {
    const e = it(t);
    if (!_(e)) return O(1);
    const n = e.getBoundingClientRect(),
        { width: i, height: o, $: l } = gt(e);
    let s = (l ? X(n.width) : n.width) / i,
        c = (l ? X(n.height) : n.height) / o;
    return (!s || !Number.isFinite(s)) && (s = 1), (!c || !Number.isFinite(c)) && (c = 1), { x: s, y: c };
}
const Pt = O(0);
function wt(t) {
    const e = b(t);
    return !nt() || !e.visualViewport ? Pt : { x: e.visualViewport.offsetLeft, y: e.visualViewport.offsetTop };
}
function Mt(t, e, n) {
    return e === void 0 && (e = !1), !n || (e && n !== b(t)) ? !1 : e;
}
function S(t, e, n, i) {
    e === void 0 && (e = !1), n === void 0 && (n = !1);
    const o = t.getBoundingClientRect(),
        l = it(t);
    let s = O(1);
    e && (i ? A(i) && (s = D(i)) : (s = D(t)));
    const c = Mt(l, n, i) ? wt(l) : O(0);
    let r = (o.left + c.x) / s.x,
        a = (o.top + c.y) / s.y,
        p = o.width / s.x,
        u = o.height / s.y;
    if (l) {
        const d = b(l),
            f = i && A(i) ? b(i) : i;
        let h = d.frameElement;
        for (; h && i && f !== d; ) {
            const g = D(h),
                y = h.getBoundingClientRect(),
                m = C(h),
                x = y.left + (h.clientLeft + parseFloat(m.paddingLeft)) * g.x,
                v = y.top + (h.clientTop + parseFloat(m.paddingTop)) * g.y;
            (r *= g.x), (a *= g.y), (p *= g.x), (u *= g.y), (r += x), (a += v), (h = b(h).frameElement);
        }
    }
    return j({ width: p, height: u, x: r, y: a });
}
function Bt(t) {
    let { rect: e, offsetParent: n, strategy: i } = t;
    const o = _(n),
        l = R(n);
    if (n === l) return e;
    let s = { scrollLeft: 0, scrollTop: 0 },
        c = O(1);
    const r = O(0);
    if ((o || (!o && i !== 'fixed')) && ((E(n) !== 'body' || H(l)) && (s = G(n)), _(n))) {
        const a = S(n);
        (c = D(n)), (r.x = a.x + n.clientLeft), (r.y = a.y + n.clientTop);
    }
    return { width: e.width * c.x, height: e.height * c.y, x: e.x * c.x - s.scrollLeft * c.x + r.x, y: e.y * c.y - s.scrollTop * c.y + r.y };
}
function Wt(t) {
    return Array.from(t.getClientRects());
}
function yt(t) {
    return S(R(t)).left + G(t).scrollLeft;
}
function Ht(t) {
    const e = R(t),
        n = G(t),
        i = t.ownerDocument.body,
        o = F(e.scrollWidth, e.clientWidth, i.scrollWidth, i.clientWidth),
        l = F(e.scrollHeight, e.clientHeight, i.scrollHeight, i.clientHeight);
    let s = -n.scrollLeft + yt(t);
    const c = -n.scrollTop;
    return C(i).direction === 'rtl' && (s += F(e.clientWidth, i.clientWidth) - o), { width: o, height: l, x: s, y: c };
}
function zt(t, e) {
    const n = b(t),
        i = R(t),
        o = n.visualViewport;
    let l = i.clientWidth,
        s = i.clientHeight,
        c = 0,
        r = 0;
    if (o) {
        (l = o.width), (s = o.height);
        const a = nt();
        (!a || (a && e === 'fixed')) && ((c = o.offsetLeft), (r = o.offsetTop));
    }
    return { width: l, height: s, x: c, y: r };
}
function Ut(t, e) {
    const n = S(t, !0, e === 'fixed'),
        i = n.top + t.clientTop,
        o = n.left + t.clientLeft,
        l = _(t) ? D(t) : O(1),
        s = t.clientWidth * l.x,
        c = t.clientHeight * l.y,
        r = o * l.x,
        a = i * l.y;
    return { width: s, height: c, x: r, y: a };
}
function ft(t, e, n) {
    let i;
    if (e === 'viewport') i = zt(t, n);
    else if (e === 'document') i = Ht(R(t));
    else if (A(e)) i = Ut(e, n);
    else {
        const o = wt(t);
        i = { ...e, x: e.x - o.x, y: e.y - o.y };
    }
    return j(i);
}
function xt(t, e) {
    const n = I(t);
    return n === e || !A(n) || K(n) ? !1 : C(n).position === 'fixed' || xt(n, e);
}
function Xt(t, e) {
    const n = e.get(t);
    if (n) return n;
    let i = W(t, [], !1).filter(c => A(c) && E(c) !== 'body'),
        o = null;
    const l = C(t).position === 'fixed';
    let s = l ? I(t) : t;
    for (; A(s) && !K(s); ) {
        const c = C(s),
            r = et(s);
        !r && c.position === 'fixed' && (o = null),
            (l ? !r && !o : (!r && c.position === 'static' && !!o && ['absolute', 'fixed'].includes(o.position)) || (H(s) && !r && xt(t, s)))
                ? (i = i.filter(p => p !== s))
                : (o = c),
            (s = I(s));
    }
    return e.set(t, i), i;
}
function Yt(t) {
    let { element: e, boundary: n, rootBoundary: i, strategy: o } = t;
    const s = [...(n === 'clippingAncestors' ? Xt(e, this._c) : [].concat(n)), i],
        c = s[0],
        r = s.reduce(
            (a, p) => {
                const u = ft(e, p, o);
                return (a.top = F(u.top, a.top)), (a.right = J(u.right, a.right)), (a.bottom = J(u.bottom, a.bottom)), (a.left = F(u.left, a.left)), a;
            },
            ft(e, c, o)
        );
    return { width: r.right - r.left, height: r.bottom - r.top, x: r.left, y: r.top };
}
function jt(t) {
    const { width: e, height: n } = gt(t);
    return { width: e, height: n };
}
function qt(t, e, n) {
    const i = _(e),
        o = R(e),
        l = n === 'fixed',
        s = S(t, !0, l, e);
    let c = { scrollLeft: 0, scrollTop: 0 };
    const r = O(0);
    if (i || (!i && !l))
        if (((E(e) !== 'body' || H(o)) && (c = G(e)), i)) {
            const a = S(e, !0, l, e);
            (r.x = a.x + e.clientLeft), (r.y = a.y + e.clientTop);
        } else o && (r.x = yt(o));
    return { x: s.left + c.scrollLeft - r.x, y: s.top + c.scrollTop - r.y, width: s.width, height: s.height };
}
function ut(t, e) {
    return !_(t) || C(t).position === 'fixed' ? null : e ? e(t) : t.offsetParent;
}
function vt(t, e) {
    const n = b(t);
    if (!_(t)) return n;
    let i = ut(t, e);
    for (; i && $t(i) && C(i).position === 'static'; ) i = ut(i, e);
    return i && (E(i) === 'html' || (E(i) === 'body' && C(i).position === 'static' && !et(i))) ? n : i || It(t) || n;
}
const Kt = async function (t) {
    let { reference: e, floating: n, strategy: i } = t;
    const o = this.getOffsetParent || vt,
        l = this.getDimensions;
    return { reference: qt(e, await o(n), i), floating: { x: 0, y: 0, ...(await l(n)) } };
};
function Gt(t) {
    return C(t).direction === 'rtl';
}
const Jt = {
    convertOffsetParentRelativeRectToViewportRelativeRect: Bt,
    getDocumentElement: R,
    getClippingRect: Yt,
    getOffsetParent: vt,
    getElementRects: Kt,
    getClientRects: Wt,
    getDimensions: jt,
    getScale: D,
    isElement: A,
    isRTL: Gt,
};
function Qt(t, e) {
    let n = null,
        i;
    const o = R(t);
    function l() {
        clearTimeout(i), n && n.disconnect(), (n = null);
    }
    function s(c, r) {
        c === void 0 && (c = !1), r === void 0 && (r = 1), l();
        const { left: a, top: p, width: u, height: d } = t.getBoundingClientRect();
        if ((c || e(), !u || !d)) return;
        const f = U(p),
            h = U(o.clientWidth - (a + u)),
            g = U(o.clientHeight - (p + d)),
            y = U(a),
            x = { rootMargin: -f + 'px ' + -h + 'px ' + -g + 'px ' + -y + 'px', threshold: F(0, J(1, r)) || 1 };
        let v = !0;
        function T(w) {
            const k = w[0].intersectionRatio;
            if (k !== r) {
                if (!v) return s();
                k
                    ? s(!1, k)
                    : (i = setTimeout(() => {
                          s(!1, 1e-7);
                      }, 100));
            }
            v = !1;
        }
        try {
            n = new IntersectionObserver(T, { ...x, root: o.ownerDocument });
        } catch {
            n = new IntersectionObserver(T, x);
        }
        n.observe(t);
    }
    return s(!0), l;
}
function Zt(t, e, n, i) {
    i === void 0 && (i = {});
    const {
            ancestorScroll: o = !0,
            ancestorResize: l = !0,
            elementResize: s = typeof ResizeObserver == 'function',
            layoutShift: c = typeof IntersectionObserver == 'function',
            animationFrame: r = !1,
        } = i,
        a = it(t),
        p = o || l ? [...(a ? W(a) : []), ...W(e)] : [];
    p.forEach(m => {
        o && m.addEventListener('scroll', n, { passive: !0 }), l && m.addEventListener('resize', n);
    });
    const u = a && c ? Qt(a, n) : null;
    let d = -1,
        f = null;
    s &&
        ((f = new ResizeObserver(m => {
            let [x] = m;
            x &&
                x.target === a &&
                f &&
                (f.unobserve(e),
                cancelAnimationFrame(d),
                (d = requestAnimationFrame(() => {
                    f && f.observe(e);
                }))),
                n();
        })),
        a && !r && f.observe(a),
        f.observe(e));
    let h,
        g = r ? S(t) : null;
    r && y();
    function y() {
        const m = S(t);
        g && (m.x !== g.x || m.y !== g.y || m.width !== g.width || m.height !== g.height) && n(), (g = m), (h = requestAnimationFrame(y));
    }
    return (
        n(),
        () => {
            p.forEach(m => {
                o && m.removeEventListener('scroll', n), l && m.removeEventListener('resize', n);
            }),
                u && u(),
                f && f.disconnect(),
                (f = null),
                r && cancelAnimationFrame(h);
        }
    );
}
const te = Lt,
    ee = (t, e, n) => {
        const i = new Map(),
            o = { platform: Jt, ...n },
            l = { ...o.platform, _c: i };
        return St(t, e, { ...o, platform: l });
    },
    ne = {
        methods: {
            positionOptions(t, e, { width: n }) {
                t.style.width = n;
                function i() {
                    ee(e.$refs.toggle, t, { placement: 'bottom', middleware: [Dt({ mainAxis: 0, crossAxis: -1 }), te()] }).then(({ x: l, y: s }) => {
                        Object.assign(t.style, { left: `${Math.round(l)}px`, top: `${Math.round(s)}px` });
                    });
                }
                const o = Zt(e.$refs.toggle, t, i);
                this.$once('hook:destroyed', o);
            },
        },
    };
function ie(t, e, n, i, o, l, s, c) {
    var r = typeof t == 'function' ? t.options : t;
    e && ((r.render = e), (r.staticRenderFns = n), (r._compiled = !0)), i && (r.functional = !0), l && (r._scopeId = 'data-v-' + l);
    var a;
    if (
        (s
            ? ((a = function (d) {
                  (d = d || (this.$vnode && this.$vnode.ssrContext) || (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext)),
                      !d && typeof __VUE_SSR_CONTEXT__ < 'u' && (d = __VUE_SSR_CONTEXT__),
                      o && o.call(this, d),
                      d && d._registeredComponents && d._registeredComponents.add(s);
              }),
              (r._ssrRegister = a))
            : o &&
              (a = c
                  ? function () {
                        o.call(this, (r.functional ? this.parent : this).$root.$options.shadowRoot);
                    }
                  : o),
        a)
    )
        if (r.functional) {
            r._injectStyles = a;
            var p = r.render;
            r.render = function (f, h) {
                return a.call(h), p(f, h);
            };
        } else {
            var u = r.beforeCreate;
            r.beforeCreate = u ? [].concat(u, a) : [a];
        }
    return { exports: t, options: r };
}
const oe = {
    mixins: [Fieldtype, ne],
    data() {
        return {
            option: this.meta.initialOption,
            options: this.initialOptions(),
            urlValue: this.meta.initialUrl,
            selectedEntries: this.meta.initialSelectedEntries,
            selectedAssets: this.meta.initialSelectedAssets,
            metaChanging: !1,
            linkTextValue: this.meta.initialText,
            openInNewTab: this.meta.initialOpenInNewTab,
        };
    },
    computed: {
        entryValue() {
            return this.selectedEntries.length ? `entry::${this.selectedEntries[0]}` : null;
        },
        assetValue() {
            return this.selectedAssets.length ? `asset::${this.selectedAssets[0]}` : null;
        },
        linkValue() {
            let t = null;
            return (
                this.option === 'url'
                    ? (t = this.urlValue)
                    : this.option === 'entry'
                      ? (t = this.entryValue)
                      : this.option === 'asset' && (t = this.assetValue),
                { link: t, text: this.linkTextValue, openInNewTab: this.openInNewTab }
            );
        },
    },
    watch: {
        option(t, e) {
            this.metaChanging ||
                (t === null
                    ? this.update(null)
                    : t === 'url'
                      ? this.updateDebounced(this.urlValue)
                      : t === 'first-child'
                        ? this.update('@child')
                        : t === 'entry'
                          ? this.entryValue
                              ? this.update(this.entryValue)
                              : setTimeout(() => this.$refs.entries.linkExistingItem(), 0)
                          : t === 'asset' && (this.assetValue ? this.update(this.assetValue) : setTimeout(() => this.$refs.assets.openSelector(), 0)));
        },
        urlValue(t) {
            this.metaChanging || this.update(t);
        },
        meta(t) {
            (this.metaChanging = !0),
                (this.urlValue = t.initialUrl),
                (this.option = t.initialOption),
                (this.selectedEntries = t.initialSelectedEntries),
                (this.selectedAssets = t.initialSelectedAssets),
                this.$nextTick(() => (this.metaChanging = !1));
        },
        linkValue(t) {
            this.metaChanging || this.update(t);
        },
    },
    methods: {
        initialOptions() {
            return [
                this.config.required ? null : { label: __('None'), value: null },
                { label: __('URL'), value: 'url' },
                this.meta.showFirstChildOption ? { label: __('First Child'), value: 'first-child' } : null,
                { label: __('Entry'), value: 'entry' },
                this.meta.showAssetOption ? { label: __('Asset'), value: 'asset' } : null,
            ].filter(t => t);
        },
        entriesSelected(t) {
            (this.selectedEntries = t), this.update(this.entryValue);
        },
        assetsSelected(t) {
            (this.selectedAssets = t), this.update(this.assetValue);
        },
    },
};
var se = function () {
        var e = this,
            n = e._self._c;
        return n('div', [
            n('div', { staticClass: 'flex items-start' }, [
                n(
                    'div',
                    { staticClass: 'mr-4 w-28' },
                    [
                        n('v-select', {
                            attrs: { 'append-to-body': '', 'calculate-position': e.positionOptions, options: e.options, clearable: !1, reduce: i => i.value },
                            scopedSlots: e._u([
                                {
                                    key: 'option',
                                    fn: function ({ label: i }) {
                                        return [e._v(' ' + e._s(e.__(i)) + ' ')];
                                    },
                                },
                            ]),
                            model: {
                                value: e.option,
                                callback: function (i) {
                                    e.option = i;
                                },
                                expression: 'option',
                            },
                        }),
                    ],
                    1
                ),
                n('div', { staticClass: 'mr-4 flex-1' }, [
                    n(
                        'div',
                        [
                            e.option === 'url'
                                ? n('text-input', {
                                      model: {
                                          value: e.urlValue,
                                          callback: function (i) {
                                              e.urlValue = i;
                                          },
                                          expression: 'urlValue',
                                      },
                                  })
                                : e._e(),
                            e.option === 'entry'
                                ? n('relationship-fieldtype', {
                                      ref: 'entries',
                                      staticClass: '-mt-0.5',
                                      attrs: { handle: 'entry', value: e.selectedEntries, config: e.meta.entry.config, meta: e.meta.entry.meta },
                                      on: {
                                          input: e.entriesSelected,
                                          'meta-updated': function (i) {
                                              e.meta.entry.meta = i;
                                          },
                                      },
                                  })
                                : e._e(),
                            e.option === 'asset'
                                ? n('assets-fieldtype', {
                                      ref: 'assets',
                                      attrs: { handle: 'asset', value: e.selectedAssets, config: e.meta.asset.config, meta: e.meta.asset.meta },
                                      on: {
                                          input: e.assetsSelected,
                                          'meta-updated': function (i) {
                                              e.meta.asset.meta = i;
                                          },
                                      },
                                  })
                                : e._e(),
                            e.option !== null
                                ? n('div', { staticClass: 'mt-2 flex items-center', attrs: { tabindex: '-1' } }, [
                                      n('input', {
                                          directives: [{ name: 'model', rawName: 'v-model', value: e.openInNewTab, expression: 'openInNewTab' }],
                                          attrs: { type: 'checkbox', id: `openInNewTab-${e._uid}` },
                                          domProps: { checked: Array.isArray(e.openInNewTab) ? e._i(e.openInNewTab, null) > -1 : e.openInNewTab },
                                          on: {
                                              change: function (i) {
                                                  var o = e.openInNewTab,
                                                      l = i.target,
                                                      s = !!l.checked;
                                                  if (Array.isArray(o)) {
                                                      var c = null,
                                                          r = e._i(o, c);
                                                      l.checked
                                                          ? r < 0 && (e.openInNewTab = o.concat([c]))
                                                          : r > -1 && (e.openInNewTab = o.slice(0, r).concat(o.slice(r + 1)));
                                                  } else e.openInNewTab = s;
                                              },
                                          },
                                      }),
                                      n('label', { staticClass: 'ml-2 text-xs', attrs: { for: `openInNewTab-${e._uid}` } }, [e._v('Open link in new tab')]),
                                  ])
                                : e._e(),
                        ],
                        1
                    ),
                ]),
                n(
                    'div',
                    { staticClass: 'flex-1' },
                    [
                        e.option !== null
                            ? n('text-input', {
                                  attrs: { placeholder: 'Enter Link Text' },
                                  model: {
                                      value: e.linkTextValue,
                                      callback: function (i) {
                                          e.linkTextValue = i;
                                      },
                                      expression: 'linkTextValue',
                                  },
                              })
                            : e._e(),
                    ],
                    1
                ),
            ]),
        ]);
    },
    le = [],
    re = ie(oe, se, le, !1, null, null, null, null);
const ce = re.exports;
Statamic.booting(() => {
    Statamic.$components.register('super_link-fieldtype', ce);
});

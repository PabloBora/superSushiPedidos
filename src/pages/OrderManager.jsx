import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoFull from '../assets/logos-03.png';

const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || '844-XXX-XXXX';
const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_LABELS = {
    paid: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

// Genera slots de 30 min entre 12:00 y 21:00
function generateTimeSlots() {
    const slots = [];
    for (let h = 12; h <= 20; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    slots.push('21:00');
    return slots;
}

// Genera los próximos 7 días como opciones de fecha
function generateDateOptions() {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push({
            value: `${yyyy}-${mm}-${dd}`,
            label: d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
        });
    }
    return dates;
}

export default function OrderManager() {
    const { token } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit pickup state
    const [editing, setEditing] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [token]);

    async function fetchOrder() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/order-manager/${token}`);
            if (res.status === 404) throw new Error('Pedido no encontrado. Verifica que el link sea correcto.');
            if (!res.ok) throw new Error('Error al cargar el pedido.');
            const data = await res.json();
            setOrder(data);
            setNewDate(data.pickup.date);
            setNewTime(data.pickup.time);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdatePickup() {
        setSaving(true);
        setSaveSuccess(false);
        try {
            const res = await fetch(`${API_BASE}/api/order-manager/${token}/pickup`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newDate, time: newTime })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al actualizar.');
            setOrder(data);
            setEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 4000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    function formatPrice(n) {
        return `$${Number(n).toFixed(2)}`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Cargando tu pedido…</p>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error && !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">🔍</div>
                    <h1 className="text-xl font-bold text-dark mb-2">Link inválido</h1>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
    const dateOptions = generateDateOptions();
    const timeSlots = generateTimeSlots();

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
                    <img src={logoFull} alt="Super Sushi" className="h-8 w-auto" />
                    <span className="text-sm text-gray-400 font-medium">Tu Pedido</span>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">

                {/* Success toast */}
                <AnimatePresence>
                    {saveSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium"
                        >
                            ✅ Horario actualizado correctamente
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error inline */}
                <AnimatePresence>
                    {error && order && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status + contact */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Estado</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Cliente</p>
                            <p className="text-sm font-semibold text-dark">{order.contact.name}</p>
                            <p className="text-xs text-gray-500">{order.contact.email}</p>
                        </div>
                    </div>
                </div>

                {/* Pickup card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-dark">📅 Recogida</h2>
                        {order.canEditPickup && !editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-sm text-primary font-semibold hover:underline"
                            >
                                Modificar
                            </button>
                        )}
                    </div>

                    {!editing ? (
                        <div>
                            <p className="text-gray-700 font-semibold text-base capitalize">{formatDate(order.pickup.date)}</p>
                            <p className="text-2xl font-bold text-primary mt-1">{order.pickup.time}</p>
                            {!order.canEditPickup && (
                                <p className="text-xs text-gray-400 mt-3">
                                    Ya no es posible modificar el horario (requiere más de 30 horas de anticipación)
                                </p>
                            )}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Nueva fecha</label>
                                <select
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-dark bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {dateOptions.map(d => (
                                        <option key={d.value} value={d.value} disabled={d.value < order.pickup.date}>
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-medium mb-1">Nueva hora</label>
                                <select
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-dark bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {timeSlots.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleUpdatePickup}
                                    disabled={saving}
                                    className="flex-1 h-10 bg-primary text-white font-bold rounded-full text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando…' : 'Actualizar horario'}
                                </button>
                                <button
                                    onClick={() => { setEditing(false); setError(null); }}
                                    className="flex-1 h-10 bg-gray-100 text-dark font-medium rounded-full text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Order summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-bold text-dark mb-4">🍣 Resumen del pedido</h2>
                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-dark">{item.name}</p>
                                    <p className="text-xs text-gray-400">x{item.qty} · {formatPrice(item.price)} c/u</p>
                                </div>
                                <p className="text-sm font-semibold text-dark">{formatPrice(item.price * item.qty)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span><span>{formatPrice(order.totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>IVA (16%)</span><span>{formatPrice(order.totals.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-dark pt-1">
                            <span>Total</span><span className="text-primary">{formatPrice(order.totals.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Cancellation contact */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                    <p className="text-sm text-gray-600">
                        Para <strong>cancelaciones</strong> llama al{' '}
                        <a href={`tel:${CONTACT_PHONE}`} className="text-primary font-bold hover:underline">
                            {CONTACT_PHONE}
                        </a>
                    </p>
                </div>

            </main>
        </div>
    );
}

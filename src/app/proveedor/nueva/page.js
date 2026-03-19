'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { useRouter } from 'next/navigation';

const SHAPES = ['Emerald Cut', 'Oval', 'Round', 'Pear', 'Cushion', 'Marquise', 'Heart', 'Cabochon', 'Other'];
const ORIGINS = ['Colombia', 'Zambia', 'Brazil', 'Ethiopia', 'Afghanistan', 'Other'];
const TONES = ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
const SATURATIONS = ['Vivid', 'Strong', 'Moderate', 'Weak'];

export default function NewStonePage() {
  const { profile, loading, supabase } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    commercial_name: '',
    weight_ct: '',
    shape: 'Emerald Cut',
    origin: 'Colombia',
    treatment: 'sin_tratar',
    color_grade: 'AA',
    color_description: '',
    tone: 'Medium',
    saturation: 'Strong',
    transparency: 'semitransparente',
    inclusions: '',
    length_mm: '',
    width_mm: '',
    depth_mm: '',
    lab_name: '',
    cert_number: '',
    precio_base: '',
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!profile) return;
    const loadSupplier = async () => {
      const { data } = await supabase
        .from('suppliers')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      setSupplier(data);
    };
    loadSupplier();
  }, [profile]);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    const uploaded = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${supplier.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('emerald-photos')
        .upload(path, file, { contentType: file.type });

      if (!error) {
        const { data: urlData } = supabase.storage.from('emerald-photos').getPublicUrl(path);
        uploaded.push({ path, url: urlData.publicUrl, name: file.name });
      }
    }

    setPhotos(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (asDraft = false) => {
    if (!supplier) return;
    setSaving(true);

    const { data: emerald, error } = await supabase.from('emeralds').insert({
      supplier_id: supplier.id,
      commercial_name: form.commercial_name || null,
      weight_ct: parseFloat(form.weight_ct) || 0,
      shape: form.shape,
      origin: form.origin,
      treatment: form.treatment,
      color_grade: form.color_grade || null,
      color_description: form.color_description || null,
      tone: form.tone || null,
      saturation: form.saturation || null,
      transparency: form.transparency || null,
      inclusions: form.inclusions || null,
      length_mm: parseFloat(form.length_mm) || null,
      width_mm: parseFloat(form.width_mm) || null,
      depth_mm: parseFloat(form.depth_mm) || null,
      lab_name: form.lab_name || null,
      cert_number: form.cert_number || null,
      precio_base: parseFloat(form.precio_base) || null,
      status: asDraft ? 'borrador' : 'pendiente_revision',
    }).select().single();

    if (error) {
      console.error('Error creating emerald:', error);
      setSaving(false);
      return;
    }

    // Insert media references
    if (photos.length > 0 && emerald) {
      const mediaRows = photos.map((p, i) => ({
        emerald_id: emerald.id,
        type: 'photo',
        url: p.url,
        sort_order: i,
      }));
      await supabase.from('emerald_media').insert(mediaRows);
    }

    setSaving(false);
    router.push('/proveedor');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-2">New Emerald</h1>
        <p className="font-body text-sm text-warm-gray mb-8">Complete the form in 3 steps to submit your stone for review.</p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {[
            { n: 1, label: 'Basic Data' },
            { n: 2, label: 'Characteristics' },
            { n: 3, label: 'Media & Price' },
          ].map((s) => (
            <div key={s.n} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors mb-2 ${step >= s.n ? 'bg-emerald-deep' : 'bg-black/5'}`} />
              <span className={`font-body text-[11px] tracking-wider uppercase ${step >= s.n ? 'text-emerald-deep font-semibold' : 'text-warm-gray'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="gs-card p-6 md:p-8">
          {/* ══ STEP 1: Basic Data ══ */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="gs-label">Commercial Name (optional)</label>
                <input type="text" value={form.commercial_name} onChange={e => update('commercial_name', e.target.value)}
                  className="gs-input" placeholder='e.g. "Muzo Imperial"' />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gs-label">Weight (ct) *</label>
                  <input type="number" step="0.01" required value={form.weight_ct} onChange={e => update('weight_ct', e.target.value)}
                    className="gs-input font-mono" placeholder="0.00" />
                </div>
                <div>
                  <label className="gs-label">Shape *</label>
                  <select value={form.shape} onChange={e => update('shape', e.target.value)} className="gs-input">
                    {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gs-label">Origin *</label>
                  <select value={form.origin} onChange={e => update('origin', e.target.value)} className="gs-input">
                    {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gs-label">Treatment</label>
                  <select value={form.treatment} onChange={e => update('treatment', e.target.value)} className="gs-input">
                    <option value="sin_tratar">No treatment</option>
                    <option value="aceite_menor">Minor oil</option>
                    <option value="aceite_moderado">Moderate oil</option>
                    <option value="resina">Resin</option>
                    <option value="otro">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => setStep(2)} disabled={!form.weight_ct}
                  className="gs-btn-primary disabled:opacity-40">
                  Next: Characteristics →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Characteristics ══ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gs-label">Color Grade</label>
                  <select value={form.color_grade} onChange={e => update('color_grade', e.target.value)} className="gs-input">
                    <option value="AAA">AAA — Intense Colombian</option>
                    <option value="AA">AA — Deep Green</option>
                    <option value="A">A — Medium Green</option>
                    <option value="B">B — Light Green</option>
                    <option value="C">C — Pale Green</option>
                  </select>
                </div>
                <div>
                  <label className="gs-label">Color Description</label>
                  <input type="text" value={form.color_description} onChange={e => update('color_description', e.target.value)}
                    className="gs-input" placeholder='e.g. "Vivid Green"' />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gs-label">Tone</label>
                  <select value={form.tone} onChange={e => update('tone', e.target.value)} className="gs-input">
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gs-label">Saturation</label>
                  <select value={form.saturation} onChange={e => update('saturation', e.target.value)} className="gs-input">
                    {SATURATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gs-label">Transparency</label>
                  <select value={form.transparency} onChange={e => update('transparency', e.target.value)} className="gs-input">
                    <option value="transparente">Transparent</option>
                    <option value="semitransparente">Semi-transparent</option>
                    <option value="translucida">Translucent</option>
                    <option value="opaca">Opaque</option>
                  </select>
                </div>
                <div>
                  <label className="gs-label">Inclusions</label>
                  <input type="text" value={form.inclusions} onChange={e => update('inclusions', e.target.value)}
                    className="gs-input" placeholder="Description of inclusions" />
                </div>
              </div>

              <div>
                <label className="gs-label">Dimensions (mm)</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" step="0.01" value={form.length_mm} onChange={e => update('length_mm', e.target.value)}
                    className="gs-input font-mono" placeholder="L" />
                  <input type="number" step="0.01" value={form.width_mm} onChange={e => update('width_mm', e.target.value)}
                    className="gs-input font-mono" placeholder="W" />
                  <input type="number" step="0.01" value={form.depth_mm} onChange={e => update('depth_mm', e.target.value)}
                    className="gs-input font-mono" placeholder="D" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gs-label">Certification Lab</label>
                  <input type="text" value={form.lab_name} onChange={e => update('lab_name', e.target.value)}
                    className="gs-input" placeholder="e.g. GIA, Gübelin, SSEF" />
                </div>
                <div>
                  <label className="gs-label">Certificate Number</label>
                  <input type="text" value={form.cert_number} onChange={e => update('cert_number', e.target.value)}
                    className="gs-input font-mono" placeholder="Certificate #" />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="gs-btn-outline">← Back</button>
                <button onClick={() => setStep(3)} className="gs-btn-primary">
                  Next: Media & Price →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Media & Price ══ */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Photo Upload */}
              <div>
                <label className="gs-label">Photos *</label>
                <div className="border-2 border-dashed border-black/10 rounded-lg p-6 text-center hover:border-emerald-deep/30 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="text-3xl text-warm-gray/40 mb-2">📷</div>
                    <p className="font-body text-sm text-warm-gray">
                      {uploading ? 'Uploading...' : 'Click to upload photos or drag & drop'}
                    </p>
                    <p className="font-body text-xs text-warm-gray/60 mt-1">JPG, PNG up to 10MB each</p>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative w-20 h-20 rounded overflow-hidden group">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white text-lg">✕</span>
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-emerald-deep text-ivory text-[8px] text-center py-0.5 font-bold tracking-wider">
                            MAIN
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="gs-label">Base Price (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-warm-gray">$</span>
                  <input type="number" step="0.01" value={form.precio_base} onChange={e => update('precio_base', e.target.value)}
                    className="gs-input font-mono !pl-8" placeholder="0.00" />
                </div>
                <p className="font-body text-xs text-warm-gray mt-2">
                  This is your price. GREENSTONE will add a margin before publishing to buyers.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-black/5">
                <button onClick={() => setStep(2)} className="gs-btn-outline">← Back</button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={saving}
                    className="gs-btn-outline"
                  >
                    {saving ? '...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={saving || !form.weight_ct || photos.length === 0}
                    className="gs-btn-primary disabled:opacity-40"
                  >
                    {saving ? (
                      <span className="inline-block w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                    ) : 'Submit for Review'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

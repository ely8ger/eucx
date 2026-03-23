"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";

const CATEGORIES = ["Metalle", "Schrott & Sekundär", "Holz & Forst", "Agrar & Lebensmittel", "Chemie & Petrochemie", "Energie & Brennstoffe", "Baustoffe", "Industriegüter"];
const SUBCATEGORIES: Record<string, string[]> = {
  "Metalle":              ["Betonstahl", "Walzdraht", "Träger / Profile", "Bleche", "Rohre", "Aluminium", "Kupfer", "Zink", "Nickel"],
  "Schrott & Sekundär":  ["Eisenschrott", "NE-Schrott", "Edelstahlschrott", "Späne"],
  "Holz & Forst":        ["Rundholz", "Schnittholz", "Furnier", "Holzpellets", "Holzspäne"],
  "Agrar & Lebensmittel":["Weizen", "Mais", "Raps", "Sonnenblumenöl", "Milchpulver", "Zucker"],
  "Chemie & Petrochemie":["Polymere (PE/PP/PVC)", "Düngemittel", "Lösungsmittel"],
  "Energie & Brennstoffe":["Koks", "Steinkohle", "Heizöl", "Pellets", "Briketts"],
  "Baustoffe":           ["Zement", "Kies / Splitt", "Ziegel", "Dachziegel", "Betonfertigteile"],
  "Industriegüter":      ["Elektromotoren", "Kabel / Leitungen", "Werkzeug", "Lager / Getriebe"],
};
const DELIVERY_TERMS = ["Franko Lager Verkäufer", "Franko Lager Käufer", "Franko Station Bestimmung", "DAP", "DDP", "FCA", "FOB", "CIF", "CPT"];

export default function NewOrderPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // ─── Validierungsschema (BUTB-Felder) ─────────────────────────────────────
  const schema = z.object({
    direction:      z.enum(["VERKAUF", "KAUF"]),
    category:       z.string().min(1, t("new_order_err_required")),
    subcategory:    z.string().min(1, t("new_order_err_required")),
    commodity:      z.string().min(2, t("new_order_err_min2")),
    specification:  z.string().min(1, t("new_order_err_required")),
    standard:       z.string().optional(),
    hsCode:         z.string().optional(),
    originCountry:  z.string().min(1, t("new_order_err_required")),
    manufacturer:   z.string().optional(),
    quantity:       z.preprocess((v) => Number(v), z.number().positive(t("new_order_err_positive"))),
    unit:           z.enum(["t", "kg", "m³", "m", "Stk", "l"]),
    currency:       z.enum(["EUR", "USD", "CHF", "GBP"]),
    priceNet:       z.preprocess((v) => Number(v), z.number().positive(t("new_order_err_positive"))),
    vatRate:        z.enum(["0", "7", "19"]),
    locationStatus: z.enum(["AUF_LAGER", "IN_TRANSIT", "ZUKUENFTIG"]),
    deliveryTerms:  z.string().min(1, t("new_order_err_required")),
    deliveryPlace:  z.string().min(1, t("new_order_err_required")),
    paymentTerms:   z.string().min(1, t("new_order_err_required")),
    deliveryDays:   z.preprocess((v) => Number(v), z.number().min(1, t("new_order_err_required"))),
    additionalInfo: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as Resolver<FormData, any>,
    defaultValues: { direction: "VERKAUF", unit: "t", currency: "EUR", vatRate: "19", locationStatus: "AUF_LAGER" },
  });

  const category   = watch("category");
  const priceNet   = watch("priceNet") || 0;
  const vatRate    = Number(watch("vatRate") || 19);
  const quantity   = watch("quantity") || 0;
  const unit       = watch("unit");
  const vatAmount  = (priceNet * vatRate) / 100;
  const priceGross = priceNet + vatAmount;
  const total      = priceGross * quantity;

  async function onSubmit(_data: FormData) {
    await new Promise((r) => setTimeout(r, 800)); // API-Call-Placeholder
    router.push("/orders");
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* ── Seiten-Header ─────────────────────────────────────────────────── */}
      <div>
        <nav className="text-xs text-gov-text-muted mb-2">
          <a href="/orders" className="hover:text-gov-blue">{t("new_order_breadcrumb_orders")}</a>
          <span className="mx-2">›</span>
          <span>{t("new_order_breadcrumb_new")}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gov-text">{t("new_order_title")}</h1>
        <p className="text-sm text-gov-text-muted mt-1">
          {t("new_order_subtitle")}
        </p>
      </div>

      {/* ── Schritt-Indikator ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {[{ n: 1, label: t("new_order_step1") }, { n: 2, label: t("new_order_step2") }].map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className={"flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium " +
              (step === s.n ? "bg-gov-blue text-white" : step > s.n ? "bg-gov-blue-light text-gov-blue" : "bg-gov-bg text-gov-text-muted")}>
              <span className={"w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold " +
                (step === s.n ? "bg-white text-gov-blue" : step > s.n ? "bg-gov-blue text-white" : "bg-gov-border text-gov-text-muted")}>
                {s.n}
              </span>
              {s.label}
            </div>
            {i < 1 && <div className="w-8 h-px bg-gov-border" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {step === 1 && (
          <div className="flex flex-col gap-5">

            {/* Richtung */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_direction")}</span>}>
              <div className="flex gap-4 pt-1">
                {(["VERKAUF", "KAUF"] as const).map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={d} {...register("direction")}
                      className="w-4 h-4 accent-gov-blue" />
                    <span className={"text-sm font-semibold " + (d === "KAUF" ? "text-gov-success" : "text-gov-error")}>
                      {d}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Warenidentifikation */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_commodity")}</span>}>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <Select label={t("new_order_lbl_category")} required placeholder={t("new_order_placeholder_select")} {...register("category")} error={errors.category?.message}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select label={t("new_order_lbl_subcategory")} required placeholder={t("new_order_placeholder_select")} {...register("subcategory")} error={errors.subcategory?.message}>
                  {(SUBCATEGORIES[category] ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label={t("new_order_lbl_commodity")} required placeholder={t("new_order_placeholder_commodity")} {...register("commodity")} error={errors.commodity?.message} />
                <Input label={t("new_order_lbl_spec")} required placeholder={t("new_order_placeholder_spec")} {...register("specification")} error={errors.specification?.message} />
                <Input label={t("new_order_lbl_standard")} placeholder={t("new_order_placeholder_standard")} {...register("standard")} />
                <Input label={t("new_order_lbl_hscode")} placeholder={t("new_order_placeholder_hscode")} {...register("hsCode")} />
                <Input label={t("new_order_lbl_origin")} required placeholder={t("new_order_placeholder_origin")} {...register("originCountry")} error={errors.originCountry?.message} />
                <Input label={t("new_order_lbl_manufacturer")} placeholder={t("new_order_placeholder_mfr")} {...register("manufacturer")} />
              </div>
            </Card>

            {/* Menge */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_qty")}</span>}>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <Input label={t("new_order_lbl_qty")} required type="number" step="0.01" placeholder={t("new_order_placeholder_qty")} suffix={unit} {...register("quantity")} error={errors.quantity?.message} />
                <Select label={t("new_order_lbl_unit")} required {...register("unit")}>
                  <option value="t">Tonnen (t)</option>
                  <option value="kg">Kilogramm (kg)</option>
                  <option value="m³">Kubikmeter (m³)</option>
                  <option value="m">Meter (m)</option>
                  <option value="Stk">Stück (Stk)</option>
                  <option value="l">Liter (l)</option>
                </Select>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)}>{t("new_order_btn_next")}</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">

            {/* Preis */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_price")}</span>}>
              <div className="grid grid-cols-3 gap-4 pt-1">
                <Select label={t("new_order_lbl_currency")} required {...register("currency")}>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US-Dollar</option>
                  <option value="CHF">CHF - Schweizer Franken</option>
                  <option value="GBP">GBP - Britisches Pfund</option>
                </Select>
                <Input label={t("new_order_lbl_price_net")} required type="number" step="0.01" placeholder={t("new_order_placeholder_price")} {...register("priceNet")} error={errors.priceNet?.message} />
                <Select label={t("new_order_lbl_vat")} required {...register("vatRate")}>
                  <option value="0">0 %</option>
                  <option value="7">7 %</option>
                  <option value="19">19 %</option>
                </Select>
              </div>

              {/* Preisvorschau */}
              {priceNet > 0 && quantity > 0 && (
                <div className="mt-4 p-3 bg-gov-bg rounded-sm border border-gov-border-light grid grid-cols-3 gap-3 text-sm">
                  <div><span className="text-gov-text-muted block text-xs">{t("new_order_lbl_price_gross")}</span><span className="font-semibold">{priceGross.toFixed(2)} {watch("currency")}</span></div>
                  <div><span className="text-gov-text-muted block text-xs">{t("new_order_lbl_vat_amount")} ({vatRate} %)</span><span className="font-semibold">{vatAmount.toFixed(2)} {watch("currency")}</span></div>
                  <div><span className="text-gov-text-muted block text-xs">{t("new_order_lbl_lot_total")}</span><span className="font-bold text-gov-blue text-base">{total.toLocaleString("de-DE", { minimumFractionDigits: 2 })} {watch("currency")}</span></div>
                </div>
              )}
            </Card>

            {/* Warenstandort */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_location")}</span>}>
              <div className="flex gap-6 pt-1">
                {(["AUF_LAGER", "IN_TRANSIT", "ZUKUENFTIG"] as const).map((v) => {
                  const labels: Record<typeof v, string> = {
                    AUF_LAGER:   t("new_order_loc_stock"),
                    IN_TRANSIT:  t("new_order_loc_transit"),
                    ZUKUENFTIG:  t("new_order_loc_future"),
                  };
                  return (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={v} {...register("locationStatus")} className="w-4 h-4 accent-gov-blue" />
                      <span className="text-sm">{labels[v]}</span>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* Lieferung & Zahlung */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_delivery")}</span>}>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <Select label={t("new_order_lbl_delivery_terms")} required placeholder={t("new_order_placeholder_select")} {...register("deliveryTerms")} error={errors.deliveryTerms?.message}>
                  {DELIVERY_TERMS.map((term) => <option key={term} value={term}>{term}</option>)}
                </Select>
                <Input label={t("new_order_lbl_delivery_place")} required placeholder={t("new_order_placeholder_delivery_place")} {...register("deliveryPlace")} error={errors.deliveryPlace?.message} />
                <Input label={t("new_order_lbl_payment_terms")} required placeholder={t("new_order_placeholder_payment")} {...register("paymentTerms")} error={errors.paymentTerms?.message} />
                <Input label={t("new_order_lbl_delivery_days")} required type="number" suffix="WT" {...register("deliveryDays")} error={errors.deliveryDays?.message} />
              </div>
            </Card>

            {/* Zusatzinfo */}
            <Card header={<span className="text-sm font-semibold text-gov-text">{t("new_order_card_extra")}</span>}>
              <textarea
                {...register("additionalInfo")}
                rows={3}
                placeholder="z. B. Länge 6 m, Zertifikat 3.1 nach EN 10204, Mindestabnahme 20 t …"
                className="w-full rounded-sm border border-gov-border text-sm text-gov-text p-3 mt-1 focus:border-gov-blue focus:ring-2 focus:ring-gov-blue/20 focus:outline-none resize-none placeholder:text-gov-text-muted"
              />
            </Card>

            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>{t("new_order_btn_back")}</Button>
              <Button type="submit" loading={isSubmitting} size="lg">{t("new_order_btn_submit")}</Button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}


import { useState, type FormEvent } from "react";
import { Pencil, Save, X } from "lucide-react";
import type { NewOffer } from "./CreateOfferModal";

type Props = {
  offer: NewOffer;
  onClose: () => void;
  onSave: (offer: NewOffer) => void;
};

const field =
  "w-full rounded-xl border border-[#dfe6dd] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2d6922] focus:ring-2 focus:ring-green-100";

const label = "mb-1.5 block text-xs font-semibold";

export default function EditOfferModal({
  offer,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<NewOffer>({ ...offer });
  const [error, setError] = useState("");

  function update(
    key: keyof NewOffer,
    value: string | number
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.product.trim() ||
      !form.category ||
      !form.classification.trim() ||
      !form.location.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (
      !Number.isFinite(form.quantity) ||
      !Number.isFinite(form.price) ||
      form.quantity <= 0 ||
      form.price <= 0
    ) {
      setError("Quantidade e preço devem ser maiores que zero.");
      return;
    }

    if (
      !form.availableFrom ||
      !form.availableUntil ||
      form.availableUntil < form.availableFrom
    ) {
      setError("Informe um período de disponibilidade válido.");
      return;
    }

    onSave({
      ...form,
      product: form.product.trim(),
      classification: form.classification.trim(),
      location: form.location.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102217]/70 p-3 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-offer-title"
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#e5e9e3] p-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#2d6922]">
              <Pencil size={17} />
              <span className="text-xs font-bold uppercase">
                Área do produtor
              </span>
            </div>
            <h2
              id="edit-offer-title"
              className="text-2xl font-extrabold"
            >
              Editar oferta
            </h2>
            <p className="mt-1 text-xs text-[#78877d]">
              {offer.product} • Altere os dados do lote
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar edição"
            className="rounded-full p-2 hover:bg-[#f2f5ef]"
          >
            <X size={19} />
          </button>
        </div>

        <form
          id="edit-offer-form"
          onSubmit={save}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5"
        >
          <div className="flex items-center justify-between gap-2 rounded-xl bg-[#edf5e8] px-4 py-3">
            <span className="text-xs font-bold text-[#287a48]">
              Edição de oferta
            </span>
            <span className="text-xs text-[#78877d]">
              Dados demonstrativos
            </span>
          </div>

          <section>
            <h3 className="mb-3 text-base font-extrabold">
              Produto e classificação
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-product" className={label}>
                  Produto *
                </label>
                <input
                  id="edit-product"
                  required
                  className={field}
                  value={form.product}
                  onChange={(e) =>
                    update("product", e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="edit-category" className={label}>
                  Categoria *
                </label>
                <select
                  id="edit-category"
                  required
                  className={field}
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value)
                  }
                >
                  <option value="Café">Café</option>
                  <option value="Milho">Milho</option>
                  <option value="Soja">Soja</option>
                  <option value="Feijão">Feijão</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-classification" className={label}>
                  Qualidade / classificação *
                </label>
                <input
                  id="edit-classification"
                  required
                  className={field}
                  value={form.classification}
                  onChange={(e) =>
                    update("classification", e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="edit-harvest" className={label}>
                  Safra
                </label>
                <select
                  id="edit-harvest"
                  className={field}
                  value={form.harvest}
                  onChange={(e) =>
                    update("harvest", e.target.value)
                  }
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-extrabold">
              Quantidade e preço
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="edit-quantity" className={label}>
                  Quantidade *
                </label>
                <input
                  id="edit-quantity"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={field}
                  value={form.quantity}
                  onChange={(e) =>
                    update("quantity", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label htmlFor="edit-unit" className={label}>
                  Unidade *
                </label>
                <select
                  id="edit-unit"
                  required
                  className={field}
                  value={form.unit}
                  onChange={(e) =>
                    update("unit", e.target.value)
                  }
                >
                  <option value="Sacas de 60 kg">
                    Sacas de 60 kg
                  </option>
                  <option value="Toneladas">Toneladas</option>
                  <option value="Quilogramas">Quilogramas</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-price" className={label}>
                  Preço por unidade *
                </label>
                <input
                  id="edit-price"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={field}
                  value={form.price}
                  onChange={(e) =>
                    update("price", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-extrabold">
              Localização e disponibilidade
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="edit-location" className={label}>
                  Localização *
                </label>
                <input
                  id="edit-location"
                  required
                  className={field}
                  value={form.location}
                  onChange={(e) =>
                    update("location", e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="edit-from" className={label}>
                  Disponível de *
                </label>
                <input
                  id="edit-from"
                  required
                  type="date"
                  className={field}
                  value={form.availableFrom}
                  onChange={(e) =>
                    update("availableFrom", e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="edit-until" className={label}>
                  Até *
                </label>
                <input
                  id="edit-until"
                  required
                  type="date"
                  min={form.availableFrom}
                  className={field}
                  value={form.availableUntil}
                  onChange={(e) =>
                    update("availableUntil", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-extrabold">
              Informações complementares
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-description" className={label}>
                  Descrição
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  className={field}
                  value={form.description}
                  placeholder="Informações sobre a produção e o lote"
                  onChange={(e) =>
                    update("description", e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="edit-observations" className={label}>
                  Observações
                </label>
                <textarea
                  id="edit-observations"
                  rows={4}
                  className={field}
                  value={form.observations}
                  placeholder="Informações para o comprador"
                  onChange={(e) =>
                    update("observations", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600"
            >
              {error}
            </p>
          )}
        </form>

        <div className="flex justify-end gap-2 border-t border-[#e5e9e3] bg-[#fafbf8] p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#dfe6dd] bg-white px-5 py-3 text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-offer-form"
            className="flex items-center gap-2 rounded-xl bg-[#2d6922] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d4818]"
          >
            <Save size={17} />
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

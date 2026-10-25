
import { useState, type FormEvent } from "react";
import {
  Check,
  ImagePlus,
  Info,
  X,
} from "lucide-react";

export type NewOffer = {
  product: string;
  category: string;
  classification: string;
  harvest: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  availableFrom: string;
  availableUntil: string;
  description: string;
  observations: string;
};

type Props = {
  onClose: () => void;
  onCreate: (offer: NewOffer) => void;
};

const initialForm = {
  product: "",
  category: "",
  classification: "",
  harvest: "2026",
  quantity: "",
  unit: "Sacas de 60 kg",
  price: "",
  location: "Fazenda Boa Vista • Patos de Minas, MG",
  availableFrom: "",
  availableUntil: "",
  description: "",
  observations: "",
};

type OfferForm = typeof initialForm;

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#dfe6dd] bg-white px-3 py-2.5 text-sm text-[#102217] outline-none focus:border-[#2d6922] focus:ring-2 focus:ring-[#2d6922]/10";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-[#102217]";

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CreateOfferModal({
  onClose,
  onCreate,
}: Props) {
  const [form, setForm] = useState<OfferForm>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const today = localToday();

  function update(field: keyof OfferForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }

  // Validar os campos antes da confirmação
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.product.trim() ||
      !form.category ||
      !form.classification.trim() ||
      !form.location.trim() ||
      !form.availableFrom ||
      !form.availableUntil
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (
      !Number.isFinite(Number(form.quantity)) ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.quantity) <= 0 ||
      Number(form.price) <= 0
    ) {
      setError("Quantidade e preço devem ser maiores que zero.");
      return;
    }

    if (form.availableFrom < today) {
      setError("A disponibilidade não pode começar no passado.");
      return;
    }

    if (form.availableUntil < form.availableFrom) {
      setError("A data final não pode ser anterior à inicial.");
      return;
    }

    setError("");
    setConfirming(true);
  }

  // Confirmar a publicação demonstrativa
  function publish() {
    onCreate({
      product: form.product.trim(),
      category: form.category,
      classification: form.classification.trim(),
      harvest: form.harvest,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: Number(form.price),
      location: form.location.trim(),
      availableFrom: form.availableFrom,
      availableUntil: form.availableUntil,
      description: form.description,
      observations: form.observations,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102217]/70 p-3 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
        className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
          confirming ? "max-w-xl" : "max-w-3xl"
        } max-h-[94vh]`}
      >
        {!confirming ? (
          <>
            {/* Cabeçalho */}
            <div className="flex items-start justify-between border-b border-[#e5e9e3] p-5">
              <div>
                <h2
                  id="offer-modal-title"
                  className="text-2xl font-extrabold text-[#102217]"
                >
                  Criar nova oferta
                </h2>
                <p className="mt-1 text-xs text-[#78877d]">
                  Preencha os dados do lote. Campos com * são obrigatórios.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar formulário"
                className="rounded-full p-2 hover:bg-[#f2f5ef]"
              >
                <X size={19} />
              </button>
            </div>

            {/* Formulário */}
            <form
              id="new-offer-form"
              onSubmit={validate}
              className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5"
            >
              {/* Produto e classificação */}
              <section>
                <h3 className="mb-3 text-base font-extrabold">
                  Produto e classificação
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="offer-product" className={labelClass}>
                      Produto *
                    </label>
                    <input
                      id="offer-product"
                      required
                      className={inputClass}
                      placeholder="Ex.: Café Arábica Especial"
                      value={form.product}
                      onChange={(e) =>
                        update("product", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-category" className={labelClass}>
                      Categoria *
                    </label>
                    <select
                      id="offer-category"
                      required
                      className={inputClass}
                      value={form.category}
                      onChange={(e) =>
                        update("category", e.target.value)
                      }
                    >
                      <option value="">Selecionar categoria</option>
                      <option value="Café">Café</option>
                      <option value="Milho">Milho</option>
                      <option value="Soja">Soja</option>
                      <option value="Feijão">Feijão</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="offer-classification"
                      className={labelClass}
                    >
                      Qualidade / classificação *
                    </label>
                    <input
                      id="offer-classification"
                      required
                      className={inputClass}
                      placeholder="Ex.: Bebida dura, tipo 6"
                      value={form.classification}
                      onChange={(e) =>
                        update("classification", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-harvest" className={labelClass}>
                      Safra
                    </label>
                    <select
                      id="offer-harvest"
                      className={inputClass}
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

              {/* Quantidade e preço */}
              <section>
                <h3 className="mb-3 text-base font-extrabold">
                  Quantidade e preço
                </h3>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="offer-quantity" className={labelClass}>
                      Quantidade *
                    </label>
                    <input
                      id="offer-quantity"
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      placeholder="Ex.: 320"
                      value={form.quantity}
                      onChange={(e) =>
                        update("quantity", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-unit" className={labelClass}>
                      Unidade *
                    </label>
                    <select
                      id="offer-unit"
                      required
                      className={inputClass}
                      value={form.unit}
                      onChange={(e) =>
                        update("unit", e.target.value)
                      }
                    >
                      <option value="Sacas de 60 kg">
                        Sacas de 60 kg
                      </option>
                      <option value="Toneladas">
                        Toneladas
                      </option>
                      <option value="Quilogramas">
                        Quilogramas
                      </option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="offer-price" className={labelClass}>
                      Preço por unidade *
                    </label>
                    <input
                      id="offer-price"
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      placeholder="Ex.: 1280.00"
                      value={form.price}
                      onChange={(e) =>
                        update("price", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Localização e disponibilidade */}
              <section>
                <h3 className="mb-3 text-base font-extrabold">
                  Localização e disponibilidade
                </h3>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="offer-location" className={labelClass}>
                      Localização *
                    </label>
                    <input
                      id="offer-location"
                      required
                      className={inputClass}
                      value={form.location}
                      onChange={(e) =>
                        update("location", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-from" className={labelClass}>
                      Disponível de *
                    </label>
                    <input
                      id="offer-from"
                      required
                      type="date"
                      min={today}
                      className={inputClass}
                      value={form.availableFrom}
                      onChange={(e) =>
                        update("availableFrom", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="offer-until" className={labelClass}>
                      Até *
                    </label>
                    <input
                      id="offer-until"
                      required
                      type="date"
                      min={form.availableFrom || today}
                      className={inputClass}
                      value={form.availableUntil}
                      onChange={(e) =>
                        update("availableUntil", e.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Informações complementares */}
              <section>
                <h3 className="mb-3 text-base font-extrabold">
                  Informações complementares
                </h3>

                <div>
                  <label
                    htmlFor="offer-description"
                    className={labelClass}
                  >
                    Descrição
                  </label>
                  <textarea
                    id="offer-description"
                    rows={3}
                    className={inputClass}
                    placeholder="Conte detalhes sobre origem, colheita e armazenamento."
                    value={form.description}
                    onChange={(e) =>
                      update("description", e.target.value)
                    }
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#dfe6dd] p-3">
                    <label
                      htmlFor="offer-images"
                      className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#2d6922]"
                    >
                      <ImagePlus size={21} />
                      Adicionar imagens
                    </label>

                    <input
                      id="offer-images"
                      type="file"
                      accept="image/png,image/jpeg"
                      multiple
                      className="mt-2 block w-full text-xs text-[#78877d] file:mr-3 file:rounded-lg file:border-0 file:bg-[#edf5e8] file:px-3 file:py-2 file:font-semibold file:text-[#2d6922]"
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.files || []
                        );

                        if (selected.length > 5) {
                          setError("Selecione no máximo 5 imagens.");
                          setFiles([]);
                          e.target.value = "";
                          return;
                        }

                        setFiles(selected);
                        setError("");
                      }}
                    />

                    <p className="mt-2 text-xs text-[#78877d]">
                      Até 5 imagens • JPG ou PNG
                    </p>

                    {files.length > 0 && (
                      <p className="mt-2 text-xs font-semibold text-[#2d6922]">
                        {files.length} imagem(ns) selecionada(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="offer-observations"
                      className={labelClass}
                    >
                      Observações
                    </label>
                    <textarea
                      id="offer-observations"
                      rows={3}
                      className={inputClass}
                      placeholder="Informações para o comprador"
                      value={form.observations}
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
                  className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600"
                >
                  {error}
                </p>
              )}
            </form>

            {/* Botões do formulário */}
            <div className="flex justify-end gap-2 border-t border-[#e5e9e3] p-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#dfe6dd] px-5 py-3 text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                type="submit"
                form="new-offer-form"
                className="rounded-xl bg-[#2d6922] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d4818]"
              >
                Publicar oferta
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmação da publicação */}
            <div className="flex items-start justify-between border-b border-[#e5e9e3] p-5">
              <div>
                <h2
                  id="offer-modal-title"
                  className="text-2xl font-extrabold"
                >
                  Tudo pronto para publicar?
                </h2>
                <p className="mt-1 text-xs text-[#78877d]">
                  Revise o resumo. Você poderá editar a oferta depois.
                </p>
              </div>

              <button
                type="button"
                aria-label="Voltar ao formulário"
                onClick={() => setConfirming(false)}
                className="rounded-full p-2 hover:bg-[#f2f5ef]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="min-h-0 space-y-4 overflow-y-auto p-5">
              <div>
                <h3 className="text-lg font-extrabold">
                  {form.product}
                </h3>
                <p className="mt-1 text-xs text-[#78877d]">
                  {form.classification} • Safra {form.harvest}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#dfe6dd] bg-[#f7f8f3] p-4 text-sm">
                <div>
                  <p className="mb-1 text-xs text-[#78877d]">
                    QUANTIDADE
                  </p>
                  <strong>
                    {form.quantity} • {form.unit}
                  </strong>
                </div>

                <div>
                  <p className="mb-1 text-xs text-[#78877d]">
                    PREÇO POR UNIDADE
                  </p>
                  <strong className="text-[#2d6922]">
                    {money(Number(form.price))}
                  </strong>
                </div>

                <div>
                  <p className="mb-1 text-xs text-[#78877d]">
                    LOCALIZAÇÃO
                  </p>
                  <strong>{form.location}</strong>
                </div>

                <div>
                  <p className="mb-1 text-xs text-[#78877d]">
                    DISPONIBILIDADE
                  </p>
                  <strong>
                    {formatDate(form.availableFrom)} a{" "}
                    {formatDate(form.availableUntil)}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-[#e6f3f9] p-3 text-xs text-[#35657d]">
                <Info size={17} className="shrink-0" />
                Após publicar, compradores poderão enviar propostas
                para este lote.
              </div>

              <p className="text-xs text-[#78877d]">
                Publicação demonstrativa. As imagens selecionadas
                ainda não serão enviadas ao servidor.
              </p>
            </div>

            {/* Botões da confirmação */}
            <div className="flex justify-end gap-2 border-t border-[#e5e9e3] p-4">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-[#dfe6dd] px-4 py-3 text-sm font-bold"
              >
                Voltar e revisar
              </button>

              <button
                type="button"
                onClick={publish}
                className="flex items-center gap-2 rounded-xl bg-[#2d6922] px-4 py-3 text-sm font-bold text-white hover:bg-[#1d4818]"
              >
                <Check size={17} />
                Confirmar publicação
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import {
  QUICK_LABELS,
  TransactionType,
  parseFrenchAmount,
} from '../types/budget';

interface QuickEntryPanelProps {
  onAddTransaction: (
    type: TransactionType,
    amount: number,
    label: string
  ) => void;
}

export const QuickEntryPanel: React.FC<QuickEntryPanelProps> = ({
  onAddTransaction,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, comma, dot, spaces
    if (/^[0-9.,\s]*$/.test(val)) {
      setAmountInput(val);
      if (errorMessage) setErrorMessage(null);
    }
  };

  const submitOperation = (type: TransactionType) => {
    const parsedAmount = parseFrenchAmount(amountInput);
    if (parsedAmount === null) {
      setErrorMessage('Saisissez un montant valide supérieur à 0 €.');
      amountRef.current?.focus();
      return;
    }

    const trimmedLabel = labelInput.trim();
    const finalLabel =
      trimmedLabel.length > 0
        ? trimmedLabel
        : type === 'credit'
          ? 'Entrée'
          : 'Dépense';

    onAddTransaction(type, parsedAmount, finalLabel);
    setAmountInput('');
    setLabelInput('');
    setErrorMessage(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOperation('debit');
  };

  return (
    <section
      aria-label="Saisie rapide d'une opération"
      className="rounded-3xl border border-white/[0.08] bg-[#101014] p-5 sm:p-6"
    >
      <h2 className="font-display text-base font-semibold text-zinc-100">
        Nouvelle opération
      </h2>

      <form onSubmit={handleFormSubmit} className="mt-4 space-y-4" noValidate>
        {/* Montant */}
        <div>
          <label
            htmlFor="operation-amount"
            className="block text-xs font-medium text-zinc-400 mb-1.5"
          >
            Montant en euros
          </label>
          <div className="relative flex items-center">
            <input
              ref={amountRef}
              id="operation-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0,00"
              value={amountInput}
              onChange={handleAmountChange}
              className="font-num w-full min-h-[56px] rounded-2xl border border-white/12 bg-[#070709] pl-4 pr-16 text-2xl font-bold text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {amountInput && (
              <button
                type="button"
                onClick={() => {
                  setAmountInput('');
                  amountRef.current?.focus();
                }}
                aria-label="Effacer le montant"
                className="absolute right-10 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <span
              aria-hidden="true"
              className="font-num pointer-events-none absolute right-4 text-xl font-semibold text-zinc-400"
            >
              €
            </span>
          </div>
          {errorMessage && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Libellé optionnel */}
        <div>
          <label
            htmlFor="operation-label"
            className="block text-xs font-medium text-zinc-400 mb-1.5"
          >
            Libellé ou catégorie (optionnel)
          </label>
          <div className="relative flex items-center">
            <input
              id="operation-label"
              type="text"
              maxLength={48}
              placeholder="Ex : Courses, Carburant, Prime..."
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="w-full min-h-[46px] rounded-xl border border-white/10 bg-[#070709] pl-3.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
            {labelInput && (
              <button
                type="button"
                onClick={() => setLabelInput('')}
                aria-label="Effacer le libellé"
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Raccourcis tactiles */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {QUICK_LABELS.map((preset) => {
              const isSelected =
                labelInput.trim().toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setLabelInput(isSelected ? '' : preset)
                  }
                  className={`min-h-[36px] rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isSelected
                      ? 'border-zinc-300 bg-zinc-100 text-zinc-950'
                      : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gros boutons au pouce */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => submitOperation('credit')}
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-500 px-3 py-3 text-sm font-bold text-zinc-950 shadow-sm transition-transform hover:bg-emerald-400 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 whitespace-nowrap"
          >
            <Plus className="h-5 w-5 shrink-0 stroke-[2.5]" aria-hidden="true" />
            <span>Crédit / Entrée</span>
          </button>

          <button
            type="button"
            onClick={() => submitOperation('debit')}
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-rose-400/25 bg-rose-500 px-3 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:bg-rose-400 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 whitespace-nowrap"
          >
            <Minus className="h-5 w-5 shrink-0 stroke-[2.5]" aria-hidden="true" />
            <span>Débit / Dépense</span>
          </button>
        </div>
      </form>
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { parseInitialAmount } from '../types/budget';

interface InitialBalanceModalProps {
  isOpen: boolean;
  currentInitial: number;
  onClose: () => void;
  onSave: (newInitial: number) => void;
}

export const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({
  isOpen,
  currentInitial,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(currentInitial === 0 ? '' : String(currentInitial).replace('.', ','));
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, currentInitial]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInitialAmount(value);
    if (parsed === null) {
      setError('Veuillez saisir un montant numérique valide.');
      return;
    }
    onSave(parsed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="initial-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/12 bg-[#121217] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700 sm:hidden" />

        <div className="flex items-center justify-between gap-4">
          <h2
            id="initial-modal-title"
            className="font-display text-lg font-bold text-white"
          >
            Salaire / Solde de départ
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1.5 text-sm text-zinc-400">
          Définissez votre salaire ou solde initial du mois. Toutes vos opérations s’y ajoutent ou s’en déduisent automatiquement.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="initial-balance-input"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Montant de départ (€)
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                id="initial-balance-input"
                type="text"
                inputMode="decimal"
                placeholder="Ex : 2200"
                value={value}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^-?[0-9.,\s]*$/.test(v)) {
                    setValue(v);
                    if (error) setError(null);
                  }
                }}
                className="font-num w-full min-h-[54px] rounded-2xl border border-white/12 bg-[#070709] pl-4 pr-12 text-2xl font-bold text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span
                aria-hidden="true"
                className="font-num pointer-events-none absolute right-4 text-xl font-semibold text-zinc-400"
              >
                €
              </span>
            </div>
            {error && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ResetMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (newStartingBalance: number) => void;
}

export const ResetMonthModal: React.FC<ResetMonthModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [nextSalary, setNextSalary] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNextSalary('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInitialAmount(nextSalary);
    onConfirmReset(parsed ?? 0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/12 bg-[#121217] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700 sm:hidden" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="h-5 w-5 text-rose-400" aria-hidden="true" />
            <h2
              id="reset-modal-title"
              className="font-display text-lg font-bold text-white"
            >
              Démarrer un nouveau mois
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
          Cette action efface l’historique des opérations du mois en cours. Vous pouvez saisir directement votre nouveau salaire ou laisser vide pour repartir à 0,00 €.
        </p>

        <form onSubmit={handleConfirm} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="new-month-salary"
              className="block text-xs font-medium text-zinc-400 mb-1.5"
            >
              Nouveau salaire / solde initial (optionnel)
            </label>
            <div className="relative flex items-center">
              <input
                id="new-month-salary"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={nextSalary}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^-?[0-9.,\s]*$/.test(v)) {
                    setNextSalary(v);
                  }
                }}
                className="font-num w-full min-h-[48px] rounded-2xl border border-white/12 bg-[#070709] pl-4 pr-12 text-lg font-bold text-white placeholder:text-zinc-600 focus:border-rose-500/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <span
                aria-hidden="true"
                className="font-num pointer-events-none absolute right-4 text-base font-semibold text-zinc-400"
              >
                €
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

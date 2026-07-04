import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  /** true → красная кнопка + показывается «Отмена» (порт confirmShowCancel дизайна). */
  danger?: boolean;
}

export type Confirm = (opts: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm>(async () => false);

export const useConfirm = () => useContext(ConfirmContext);

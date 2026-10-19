'use client';

import Modal from '@/components/ui/Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Yes, Proceed',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={message}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmVariant={confirmVariant}
      loading={loading}
    />
  );
}

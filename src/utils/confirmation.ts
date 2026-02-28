export const showConfirmation = async ({
  title,
  message,
  confirmText: _confirmText = 'Yes',
  cancelText: _cancelText = 'No',
  type: _type = 'warning'
}: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'info' | 'success'
}): Promise<boolean> => {
  // Simple browser confirm
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${title}\n\n${message}`)
    resolve(confirmed)
  })
}
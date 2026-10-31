import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRemoveAvatar, useUploadAvatar } from '../../hooks/useMe'
import { fieldErrorsOf } from '../../services/http'
import Avatar from '../ui/Avatar'
import Icon from '../ui/Icon'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

export default function ProfilePicture({ url }: { url: string | null }) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()
  const busy = upload.isPending || remove.isPending

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // so choosing the same file again still fires
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t('profileSettings.errors.imageType'))
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('profileSettings.errors.imageSize'))
      return
    }

    upload.mutate(file, {
      onSuccess: () => toast.success(t('profileSettings.pictureSaved')),
      onError: (error) => {
        // The API checks the contents, so a renamed file can get this far.
        if (fieldErrorsOf(error).file) toast.error(t('profileSettings.errors.imageType'))
      },
    })
  }

  return (
    <div className="flex flex-col items-center gap-sm shrink-0">
      <Avatar url={url} size={96} iconSize={40} className={`border-2 border-primary-container ${busy ? 'opacity-60' : ''}`} />
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFile}
        aria-label={t('profileSettings.changePicture')}
        className="sr-only"
        tabIndex={-1}
      />
      <div className="flex items-center gap-xs">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="flex items-center gap-xs rounded-lg px-sm py-xs font-label-sm text-label-sm text-primary transition-colors hover:bg-surface-container disabled:opacity-60"
        >
          <Icon name="camera" size={16} />
          {upload.isPending ? t('profileSettings.uploading') : t('profileSettings.changePicture')}
        </button>
        {url ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => remove.mutate(undefined, { onSuccess: () => toast.success(t('profileSettings.pictureRemoved')) })}
            aria-label={t('profileSettings.removePicture')}
            title={t('profileSettings.removePicture')}
            className="rounded-lg p-xs text-secondary transition-colors hover:bg-error-container hover:text-error disabled:opacity-60"
          >
            <Icon name="trash-2" size={16} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

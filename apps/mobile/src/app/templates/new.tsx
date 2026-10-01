import { TemplateForm } from '@/components/templates/template-form';
import { emptyTemplateDraft } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

export default function NewTemplate() {
  const { locale } = useTranslations();

  return <TemplateForm initial={emptyTemplateDraft(locale)} />;
}

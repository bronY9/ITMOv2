import SubjectOutlined from '@mui/icons-material/SubjectOutlined';
import { Alert, AlertTitle, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import type { ReviewState } from './review';

export function ReviewResult({ state, onRetry }: { state: ReviewState; onRetry: () => void }) {
  if (state.kind === 'loading') {
    return (
      <Box role="status" sx={{ py: 3 }}>
        <Typography sx={{ fontWeight: 650 }}>Проверяем изменения…</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Ответ появится здесь. Повторная отправка недоступна.
        </Typography>
        <Stack sx={{ gap: 1.5 }} aria-hidden="true">
          <Skeleton variant="rounded" height={12} />
          <Skeleton variant="rounded" height={12} width="85%" />
          <Skeleton variant="rounded" height={12} width="65%" />
        </Stack>
      </Box>
    );
  }

  if (state.kind === 'error') {
    return (
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 1 }}>
        <AlertTitle>Не удалось получить ревью</AlertTitle>
        {state.message} Введённый diff сохранён.
        <Box sx={{ mt: 1.5 }}>
          <Button color="inherit" onClick={onRetry}>Повторить попытку</Button>
        </Box>
      </Alert>
    );
  }

  if (state.kind === 'success') {
    return (
      <Box className="review-markdown" sx={{ fontSize: 14, lineHeight: 1.8 }}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => <Typography variant="subtitle1" component="h3">{children}</Typography>,
            h2: ({ children }) => <Typography variant="subtitle1" component="h3">{children}</Typography>,
            h3: ({ children }) => <Typography variant="subtitle1" component="h3">{children}</Typography>,
          }}
        >{state.comment}</ReactMarkdown>
      </Box>
    );
  }

  const emptyAnswer = state.kind === 'empty';
  return (
    <Box sx={{ textAlign: 'center', py: 5, px: 2 }}>
      <Box sx={{ width: 52, height: 52, border: '1px solid', borderColor: 'divider', borderRadius: '15px', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
        <SubjectOutlined sx={{ color: '#8792a6', fontSize: 27 }} aria-hidden="true" />
      </Box>
      <Typography variant="subtitle1" component="h3" sx={{ mb: 1 }}>
        {emptyAnswer ? 'Модель вернула пустой ответ' : 'Ревью появится здесь'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto' }}>
        {emptyAnswer ? 'Попробуйте запустить проверку ещё раз.' : 'Добавьте diff и запустите проверку.'}
      </Typography>
      {emptyAnswer && <Button onClick={onRetry} sx={{ mt: 2 }}>Повторить проверку</Button>}
    </Box>
  );
}

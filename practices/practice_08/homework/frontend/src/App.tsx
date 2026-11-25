import { useEffect, useRef, useState } from 'react';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import {
  Box, Button, Card, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, FormLabel, Stack, TextField, Typography,
} from '@mui/material';
import { characterCount, requestReview, SAMPLE_DIFF, validateDiff } from './review';
import type { ReviewState } from './review';
import { ReviewResult } from './ReviewResult';

export default function App() {
  const [diff, setDiff] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [state, setState] = useState<ReviewState>({ kind: 'initial' });
  const [helpOpen, setHelpOpen] = useState(false);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const isLoading = state.kind === 'loading';

  useEffect(() => {
    if (['success', 'empty', 'error'].includes(state.kind)) resultRef.current?.focus();
  }, [state.kind]);

  async function submitReview() {
    // ref блокирует повтор ещё до следующего рендера React.
    if (inFlight.current) return;
    const error = validateDiff(diff);
    setFieldError(error);
    if (error) {
      inputRef.current?.focus();
      return;
    }
    inFlight.current = true;
    setState({ kind: 'loading' });
    try {
      const comment = await requestReview(diff);
      setState(comment.trim() ? { kind: 'success', comment } : { kind: 'empty' });
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof TypeError || error instanceof SyntaxError
          ? 'Проверьте подключение к сервису и повторите попытку.'
          : error instanceof Error ? error.message : 'Не удалось выполнить запрос.',
      });
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <>
      <Container component="header" maxWidth={false} className="page-header">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box className="brand-icon"><CodeOutlined aria-hidden="true" /></Box>
          <Typography component="span" sx={{ fontSize: 21, fontWeight: 750 }}>Ревью</Typography>
          <Chip label="Локальный ассистент" variant="outlined" size="small" sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.secondary', fontSize: 12 }} />
        </Stack>
        <Button onClick={() => setHelpOpen(true)}>Как получить diff</Button>
      </Container>

      <Container component="main" maxWidth={false} className="page-main">
        <Typography component="p" variant="overline" color="primary" sx={{ letterSpacing: 1.5 }}>Второе мнение о вашем коде</Typography>
        <Typography component="h1" variant="h1" sx={{ mt: 1.5, mb: 1.75, fontSize: { xs: 29, sm: 38 } }}>
          Проверьте изменения<br />перед коммитом
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 660 }}>
          Вставьте git diff. Ассистент отметит возможные ошибки и предложит, что проверить.
        </Typography>

        <Box className="workspace">
          <Card component="section" aria-labelledby="input-heading" className="workspace-card">
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 3 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">01 / Изменения</Typography>
                <Typography id="input-heading" component="h2" variant="h2">Что изменилось?</Typography>
              </Box>
              <Button disabled={isLoading} onClick={() => {
                setDiff(SAMPLE_DIFF);
                setFieldError(null);
                inputRef.current?.focus();
              }}>Вставить пример</Button>
            </Stack>

            <Box component="form" noValidate onSubmit={event => { event.preventDefault(); void submitReview(); }}>
              <FormLabel htmlFor="diff" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 650, color: 'text.primary' }}>Diff изменений</FormLabel>
              <TextField
                id="diff" fullWidth multiline rows={12} inputRef={inputRef}
                value={diff} error={!!fieldError}
                onChange={event => { setDiff(event.target.value); if (fieldError) setFieldError(null); }}
                onKeyDown={event => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault();
                    void submitReview();
                  }
                }}
                placeholder={'diff --git a/example.py b/example.py\n@@ -1,2 +1,2 @@\n- старый код\n+ новый код'}
                helperText={fieldError}
                slotProps={{
                  input: { readOnly: isLoading },
                  htmlInput: { spellCheck: false, 'aria-describedby': `diff-hint${fieldError ? ' diff-helper-text' : ''}`, 'aria-required': 'true' },
                  formHelperText: { role: fieldError ? 'alert' : undefined },
                }}
              />
              <Stack id="diff-hint" direction="row" sx={{ justifyContent: 'space-between', gap: 1, mt: 1, mb: 2.5, color: 'text.secondary' }}>
                <Typography variant="caption">До 20 000 символов</Typography>
                <Typography variant="caption">{characterCount(diff).toLocaleString('ru-RU')} / 20 000</Typography>
              </Stack>
              <Button type="submit" variant="contained" disabled={isLoading} className="submit-button"
                endIcon={isLoading ? <CircularProgress size={16} color="inherit" aria-hidden="true" /> : <ArrowForward aria-hidden="true" />}>
                {isLoading ? 'Проверяем…' : 'Проверить изменения'}
              </Button>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
                Ctrl / ⌘ + Enter — отправить. При ошибке diff сохраняется.
              </Typography>
            </Box>
          </Card>

          <Card component="section" aria-labelledby="result-heading" className="workspace-card">
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">02 / Результат</Typography>
                <Typography id="result-heading" component="h2" variant="h2">Ревью изменений</Typography>
              </Box>
              {state.kind === 'success' && <Chip label="Готово" color="success" size="small" variant="outlined" />}
            </Stack>
            <Box ref={resultRef} tabIndex={-1} role="region" aria-label="Результат ревью" aria-busy={isLoading}
              className={`result-content ${state.kind === 'success' ? 'result-success' : ''}`}>
              <ReviewResult state={state} onRetry={() => void submitReview()} />
            </Box>
          </Card>
        </Box>
      </Container>

      <Container component="footer" maxWidth={false} className="page-footer">
        <Typography variant="caption" color="text.secondary">Ассистент для код-ревью · один diff — одно ревью</Typography>
      </Container>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} aria-labelledby="help-title" maxWidth="sm" fullWidth>
        <DialogTitle id="help-title">Как получить diff</DialogTitle>
        <DialogContent>
          <Typography variant="body2">В папке своего проекта выполните:</Typography>
          <Box component="pre" className="command">git diff</Box>
          <Typography variant="body2">Для изменений, добавленных в индекс:</Typography>
          <Box component="pre" className="command">git diff --cached</Box>
          <Typography variant="body2">Скопируйте вывод в поле «Diff изменений».</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}><Button autoFocus variant="contained" onClick={() => setHelpOpen(false)}>Понятно</Button></DialogActions>
      </Dialog>
    </>
  );
}

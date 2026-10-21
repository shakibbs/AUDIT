import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ActionDrawer } from '@/components/drawers/ActionDrawer';
import { actions } from '@/mock/data/work';
import { server } from '../msw';
import { renderScreen } from '../utils';

const real = { ...actions[0], id: 'f-7', decision: null, fixStepDraft: true, fixStep: 'Companies commonly check that STOP replies reach every tool.' };

describe('deciding on a finding (Module 11 step 2)', () => {
  it('saves a decision with its note and labels the common response as a draft', async () => {
    let sent: unknown = null;
    server.use(
      http.get('*/api/actions', () => HttpResponse.json([real])),
      http.patch('*/api/actions/f-7', async ({ request }) => { sent = await request.json(); return HttpResponse.json(real); }),
    );
    renderScreen(<ActionDrawer id="f-7" onClose={() => {}} />);
    expect(await screen.findByText('Draft · for your lawyers to review')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Declined' }));
    await user.type(screen.getByLabelText('Decision note'), 'Reviewed with counsel.');
    await user.click(screen.getByRole('button', { name: 'Save decision' }));
    expect(sent).toMatchObject({ decision: { choice: 'declined', note: 'Reviewed with counsel.' } });
  });

  it('keeps the sample action without a decision section', async () => {
    renderScreen(<ActionDrawer id="a-1" onClose={() => {}} />);
    expect(await screen.findByText(actions[0].title)).toBeInTheDocument();
    expect(screen.queryByText('Your decision')).not.toBeInTheDocument();
  });
});

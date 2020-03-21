import { undo } from '@codemirror/next/history';
import { TestDriver } from './test-driver';

test('undo sends all changes as a single replace', async () => {
    const driver = await TestDriver.new({ textWithCursor: '{d:f2}{d:f2}|' });

    driver.keys.backspace('{d:f2}'.length);
    driver.dispatchCMCommand(undo);
    await driver.completeBackgroundWork();

    const lastSent = driver.socket.sent.filter(c => !c.startsWith('U')).slice(-1)[0];
    expect(lastSent).toBe('R6:0:12::{d:f2}');
});

test('tab is replaced with 4 spaces', async () => {
    const driver = await TestDriver.new({ textWithCursor: '|' });

    driver.keys.press('tab');
    await driver.completeBackgroundWork();

    const value = driver.cmState.doc.toString();

    expect(value).toBe('    ');
});
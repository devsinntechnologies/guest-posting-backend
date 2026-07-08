import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { ContentController } from './content.controller';

describe('ContentController subscription guards', () => {
  it('requires an active subscription for creating, editing, submitting, and resubmitting content', () => {
    const createGuards = Reflect.getMetadata(GUARDS_METADATA, ContentController.prototype.create);
    const updateGuards = Reflect.getMetadata(GUARDS_METADATA, ContentController.prototype.update);
    const submitGuards = Reflect.getMetadata(GUARDS_METADATA, ContentController.prototype.submit);
    const resubmitGuards = Reflect.getMetadata(GUARDS_METADATA, ContentController.prototype.resubmit);
    const deleteGuards = Reflect.getMetadata(GUARDS_METADATA, ContentController.prototype.delete);

    const guardList = [createGuards, updateGuards, submitGuards, resubmitGuards, deleteGuards];

    for (const guards of guardList) {
      expect(guards).toBeDefined();
      expect(guards).toEqual(expect.arrayContaining([SubscriptionGuard]));
    }
  });
});

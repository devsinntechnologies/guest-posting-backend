import { Module } from '@nestjs/common';
import { FileUploadService } from './services/file-upload.service';
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  providers: [FileUploadService, RolesGuard, OwnershipGuard],
  exports: [FileUploadService, RolesGuard, OwnershipGuard],
})
export class CommonModule {}

import { Module } from '@nestjs/common';
import { FileUploadService } from './services/file-upload.service';
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Module({
  providers: [FileUploadService, RolesGuard, OwnershipGuard, OptionalJwtAuthGuard],
  exports: [FileUploadService, RolesGuard, OwnershipGuard, OptionalJwtAuthGuard],
})
export class CommonModule {}

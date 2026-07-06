import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LinkInsertionsService } from './link-insertions.service';
import {
  CreateLinkInsertionDto,
  UpdateLinkInsertionStatusDto,
} from './dto/link-insertions.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Link Insertions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('link-insertions')
export class LinkInsertionsController {
  constructor(private linkInsertionsService: LinkInsertionsService) {}

  @Get()
  @ApiOperation({ summary: 'List link insertions (own for contributors)' })
  findAll(
    @Query() query: PaginationDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.linkInsertionsService.findAll(query, userId, role);
  }

  @Post()
  @ApiOperation({ summary: 'Request link insertion' })
  create(
    @Body() dto: CreateLinkInsertionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.linkInsertionsService.create(dto, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update link insertion status (admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLinkInsertionStatusDto,
  ) {
    return this.linkInsertionsService.updateStatus(id, dto);
  }
}

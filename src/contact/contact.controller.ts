import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ContactService } from './contact.service';
import { ContactMessageQueryDto, CreateContactMessageDto } from './dto/contact.dto';
import { Public, Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Contact Us')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Submit contact form message.
   * Public.
   */
  @Post()
  @Public()
  @ApiOperation({ summary: 'Public — Submit a support/contact message' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  /**
   * List contact messages.
   * ADMIN only.
   */
  @Get()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — List contact messages' })
  findAll(@Query() query: ContactMessageQueryDto) {
    return this.contactService.findAll(query);
  }

  /**
   * Mark contact message as read.
   * ADMIN only.
   */
  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — Mark contact message as read' })
  @ApiParam({ name: 'id', description: 'Contact message UUID' })
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }
}

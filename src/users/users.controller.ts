import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { UsersService } from './users.service';
import {
  AdminUpdateUserDto,
  AdminUserQueryDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto/user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ADMIN: List all users with filters.
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ADMIN — List all users with filters' })
  findAll(@Query() query: AdminUserQueryDto) {
    return this.usersService.findAll(query);
  }

  /**
   * Get own profile with active subscription.
   */
  @Get('me')
  @ApiOperation({ summary: 'Get own profile' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.getMyProfile(user.sub);
  }

  /**
   * Update own profile fields.
   */
  @Patch('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  /**
   * Change own password.
   */
  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own password' })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.sub, dto);
  }

  /**
   * Get a user's public profile by ID.
   */
  @Get(':id')
  @ApiOperation({ summary: "Get a user's public profile" })
  @ApiParam({ name: 'id', description: 'User UUID' })
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * ADMIN: Update a user's role or active status.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "ADMIN — Update a user's role or status" })
  @ApiParam({ name: 'id', description: 'User UUID' })
  adminUpdateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdateUser(id, dto);
  }

  /**
   * ADMIN: Soft-delete a user account.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN — Soft-delete a user account' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  softDelete(
    @CurrentUser() admin: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.usersService.softDelete(admin.sub, id);
  }
}

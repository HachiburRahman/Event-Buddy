// /Users/jalalsmac/event-buddy/backend/src/events/events.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { IdentifierDto } from './dto/identifier.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Public } from '../common/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { multerOptions } from '../config/multer.config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Returns upcoming events with pagination' })
  findUpcoming(@Query() paginationDto: PaginationDto) {
    return this.eventsService.findUpcoming(paginationDto);
  }

  @Public()
  @Get('past')
  @ApiOperation({ summary: 'Get past events' })
  @ApiResponse({ status: 200, description: 'Returns past events with pagination' })
  findPast(@Query() paginationDto: PaginationDto) {
    return this.eventsService.findPast(paginationDto);
  }

  @Public()
  @Post('/public/find')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get event by ID (public)' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  publicFindOne(@Body() identifierDto: IdentifierDto) {
    return this.eventsService.findOne(identifierDto.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiConsumes('multipart/form-data')
  create(@Body() createEventDto: CreateEventDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      createEventDto.imageUrl = `/uploads/${file.filename}`;
    }
    delete (createEventDto as any).image;
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all events (Admin only)' })
  @ApiResponse({ status: 200, description: 'All events retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Post('/find')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get event by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Body() identifierDto: IdentifierDto) {
    return this.eventsService.findOne(identifierDto.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiConsumes('multipart/form-data')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (file) {
      updateEventDto.imageUrl = `/uploads/${file.filename}`;
    }

    delete (updateEventDto as any).image;

    return this.eventsService.update(id, updateEventDto);
  }

  @Delete()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete event (Admin only)' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Body() identifierDto: IdentifierDto) {
    return this.eventsService.remove(identifierDto.id);
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/role.enum';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  country?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ default: UserRole.USER })
  role: UserRole;

  @Prop()
  profileImageUrl?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;

  // Social links
  @Prop()
  facebookUrl?: string;

  @Prop()
  twitterUrl?: string;

  @Prop()
  linkedInUrl?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  refreshToken?: string; 
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

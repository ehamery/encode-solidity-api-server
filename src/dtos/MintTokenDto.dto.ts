import { ApiProperty } from '@nestjs/swagger';

export class MintTokenDto {
  @ApiProperty({ type: String, required: true, default: 'wallet address' })
  recipientAddress: string;
  @ApiProperty({ type: String, required: true, default: 'MKTV amount' })
  amount: string;
  @ApiProperty({ type: String, required: true, default: 'password' })
  password: string;
}

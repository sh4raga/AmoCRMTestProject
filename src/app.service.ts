import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import 'dotenv/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async updateCode(code): Promise<string> {
    process.env['AMO_CODE'] = code;
    return 'OK';
  }

  async getUser(query, token): Promise<any> {
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `${token}`,
    };

    let { data } = await firstValueFrom(
      this.httpService
        .get<any>(
          process.env.PROTOCOL +
            process.env.AMO_API_ADDRESS +
            process.env.API_PREFIX +
            `contacts?query=${query.name}&query=${query.email}&query=${query.phone}`,
          { headers: headersRequest },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );
    let id = data?._embedded?.contacts[0].id;
    if (typeof id == 'undefined') {
      data = await this.createUser(query, headersRequest);
      id = data?._embedded?.contacts[0].id;
    } else {
      await this.updateUser(id, query, headersRequest);
    }
    await this.postLead(id, headersRequest); // Вызов метода создания сделки
    return data;
  }

  async createUser(query, headersRequest) {
    const body = [
      {
        name: query.name,
        custom_fields_values: [
          {
            field_id: 37775,
            values: [
              {
                value: query.phone,
                enum_id: 18615,
                enum_code: 'WORK',
              },
            ],
          },
          {
            field_id: 37777,
            values: [
              {
                value: query.email,
                enum_id: 18627,
                enum_code: 'WORK',
              },
            ],
          },
        ],
      },
    ];
    const { data } = await firstValueFrom(
      // Запрос на создание контакта
      this.httpService
        .post<any>(
          process.env.PROTOCOL +
            process.env.AMO_API_ADDRESS +
            process.env.API_PREFIX +
            `contacts`,
          body,
          { headers: headersRequest },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );
    return data;
  }

  async postLead(contactId, headersRequest): Promise<any> {
    const body = [
      {
        _embedded: {
          contacts: [
            {
              id: contactId,
              is_main: true,
            },
          ],
        },
      },
    ];
    await firstValueFrom(
      // Запрос на создание сделки
      this.httpService
        .post<any>(
          process.env.PROTOCOL +
            process.env.AMO_API_ADDRESS +
            process.env.API_PREFIX +
            `leads`,
          body,
          { headers: headersRequest },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );
  }

  async updateUser(contactId, query, headersRequest) {
    const body = [
      {
        id: contactId,
        name: query.name,
        custom_fields_values: [
          {
            field_id: 37775,
            values: [
              {
                value: query.phone,
                enum_id: 18615,
                enum_code: 'WORK',
              },
            ],
          },
          {
            field_id: 37777,
            values: [
              {
                value: query.email,
                enum_id: 18627,
                enum_code: 'WORK',
              },
            ],
          },
        ],
      },
    ];
    const { data } = await firstValueFrom(
      // Запрос на создание контакта
      this.httpService
        .patch<any>(
          process.env.PROTOCOL +
            process.env.AMO_API_ADDRESS +
            process.env.API_PREFIX +
            `contacts`,
          body,
          { headers: headersRequest },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );
    return data;
  }

  async refreshToken(code): Promise<any> {
    const body = {
      client_id: process.env.AMO_ID,
      client_secret: process.env.AMO_PRIVATE_KEY,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.REDIRECT_URL,
    };
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(
          process.env.PROTOCOL +
            process.env.AMO_API_ADDRESS +
            '/oauth2/access_token',
          body,
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );
    return data;
  }
}
